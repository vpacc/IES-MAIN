import Course from "../models/Course.js"
import { CourseProgress } from "../models/CourseProgress.js"
import { Purchase } from "../models/Purchase.js"
import User from "../models/User.js"
import stripe from "stripe"
import { clerkClient } from "@clerk/express"

// Get User Data
export const getUserData = async (req, res) => {
    try {
        const userId = req.auth.userId;
        console.log("Tìm người dùng với ID:", userId);
        
        // Tìm người dùng trong database
        let user = await User.findById(userId);
        
        // Nếu người dùng không tồn tại trong MongoDB nhưng tồn tại trong Clerk
        if (!user) {
            console.log("Không tìm thấy người dùng trong MongoDB, thử tạo mới từ dữ liệu Clerk");
            
            try {
                // Lấy thông tin từ Clerk
                const clerkUser = await clerkClient.users.getUser(userId);
                console.log("Thông tin Clerk user:", JSON.stringify(clerkUser));
                
                // Tạo bản ghi mới trong MongoDB
                user = await User.create({
                    _id: userId,
                    email: clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0 
                        ? clerkUser.emailAddresses[0].emailAddress 
                        : "unknown@email.com",
                    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || "Unnamed User",
                    imageUrl: clerkUser.imageUrl || "",
                    resume: '',
                    enrolledCourses: [] // Khởi tạo mảng enrolledCourses trống
                });
                
                console.log("Đã tạo người dùng mới trong database:", userId);
            } catch (clerkError) {
                console.error("Lỗi khi lấy thông tin từ Clerk:", clerkError);
                return res.json({ success: false, message: 'User Not Found - Không thể tạo người dùng mới' });
            }
        }
        
        res.json({ success: true, user });
        
    } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        res.json({ success: false, message: error.message });
    }
}

// Purchase Course 
export const purchaseCourse = async (req, res) => {

    try {

        const { courseId } = req.body
        const { origin } = req.headers


        const userId = req.auth.userId

        const courseData = await Course.findById(courseId)
        const userData = await User.findById(userId)

        if (!userData || !courseData) {
            return res.json({ success: false, message: 'Không tìm thấy dữ liệu' })
        }

        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2),
        }

        const newPurchase = await Purchase.create(purchaseData)

        // Stripe Gateway Initialize
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

        const currency = process.env.CURRENCY.toLocaleLowerCase()

        // Creating line items to for Stripe
        const line_items = [{
            price_data: {
                currency,
                product_data: {
                    name: courseData.courseTitle
                },
                unit_amount: Math.floor(newPurchase.amount) * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString()
            }
        })

        res.json({ success: true, session_url: session.url });


    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Users Enrolled Courses With Lecture Links
export const userEnrolledCourses = async (req, res) => {
    try {
        const userId = req.auth.userId;
        
        // Tìm user trong database
        const userData = await User.findById(userId)
            .populate('enrolledCourses');
            
        // Kiểm tra nếu userData không tồn tại
        if (!userData) {
            // Tự động tạo user mới nếu chưa tồn tại
            console.log("Không tìm thấy user khi lấy enrolled courses, thử tạo user mới");
            try {
                // Lấy thông tin từ Clerk
                const clerkUser = await clerkClient.users.getUser(userId);
                
                // Tạo user mới
                const newUser = await User.create({
                    _id: userId,
                    email: clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0 
                        ? clerkUser.emailAddresses[0].emailAddress 
                        : "unknown@email.com",
                    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || "Unnamed User",
                    imageUrl: clerkUser.imageUrl || "",
                    resume: '',
                    enrolledCourses: [] // Khởi tạo mảng enrolledCourses trống
                });
                
                console.log("Đã tạo user mới trong userEnrolledCourses:", userId);
                return res.json({ success: true, enrolledCourses: [] });
            } catch (error) {
                console.error("Lỗi khi tạo user mới:", error);
                return res.json({ success: false, message: "User không tồn tại", enrolledCourses: [] });
            }
        }
        
        res.json({ success: true, enrolledCourses: userData.enrolledCourses || [] });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách khóa học đã đăng ký:", error);
        res.json({ success: false, message: error.message, enrolledCourses: [] });
    }
}

// Update User Course Progress
export const updateUserCourseProgress = async (req, res) => {

    try {

        const userId = req.auth.userId

        const { courseId, lectureId } = req.body

        const progressData = await CourseProgress.findOne({ userId, courseId })

        if (progressData) {

            if (progressData.lectureCompleted.includes(lectureId)) {
                return res.json({ success: true, message: 'Bài giảng đã hoàn thành' })
            }

            progressData.lectureCompleted.push(lectureId)
            await progressData.save()

        } else {

            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: [lectureId]
            })

        }

        res.json({ success: true, message: 'Đã cập nhật tiến độ' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// get User Course Progress
export const getUserCourseProgress = async (req, res) => {

    try {

        const userId = req.auth.userId

        const { courseId } = req.body

        const progressData = await CourseProgress.findOne({ userId, courseId })

        res.json({ success: true, progressData })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Add User Ratings to Course
export const addUserRating = async (req, res) => {
    const userId = req.auth.userId;
    const { courseId, rating } = req.body;

    // Validate inputs
    if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
        return res.json({ success: false, message: 'Thông tin không hợp lệ' });
    }

    try {
        // Find the course by ID
        const course = await Course.findById(courseId);

        if (!course) {
            return res.json({ success: false, message: 'Khóa học không được tìm thấy' });
        }

        // Tìm user
        const user = await User.findById(userId);

        // Kiểm tra user và enrolledCourses trước khi truy cập
        if (!user) {
            console.log("User không tồn tại khi đánh giá khóa học:", userId);
            try {
                // Tự động tạo user mới
                const clerkUser = await clerkClient.users.getUser(userId);
                const newUser = await User.create({
                    _id: userId,
                    email: clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0 
                        ? clerkUser.emailAddresses[0].emailAddress 
                        : "unknown@email.com",
                    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || "Unnamed User",
                    imageUrl: clerkUser.imageUrl || "",
                    resume: '',
                    enrolledCourses: [] // Khởi tạo mảng enrolledCourses trống
                });
                return res.json({ success: false, message: 'Tài khoản của bạn chưa đăng ký khóa học này.' });
            } catch (error) {
                console.error("Lỗi khi tạo user mới trong addUserRating:", error);
                return res.json({ success: false, message: 'User không tồn tại' });
            }
        }

        // Kiểm tra enrolledCourses và includes
        if (!user.enrolledCourses || !Array.isArray(user.enrolledCourses) || !user.enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: 'Người dùng chưa mua khóa học này.' });
        }

        // Check is user already rated
        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId);

        if (existingRatingIndex > -1) {
            // Update the existing rating
            course.courseRatings[existingRatingIndex].rating = rating;
        } else {
            // Add a new rating
            course.courseRatings.push({ userId, rating });
        }

        await course.save();

        return res.json({ success: true, message: 'Đã thêm đánh giá' });
    } catch (error) {
        console.error("Lỗi trong addUserRating:", error);
        return res.json({ success: false, message: error.message });
    }
};
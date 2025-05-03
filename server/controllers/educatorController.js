import { v2 as cloudinary } from 'cloudinary'
import Course from '../models/Course.js';
import { Purchase } from '../models/Purchase.js';
import User from '../models/User.js';
import { clerkClient } from '@clerk/express'

// update role to educator
export const updateRoleToEducator = async (req, res) => {

    try {

        const userId = req.auth.userId

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator',
            },
        })

        res.json({ success: true, message: 'You can publish a course now' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }

}

// Add New Course
export const addCourse = async (req, res) => {
    try {
        console.log("=== addCourse function called ===");
        console.log("Request body:", req.body);
        console.log("File:", req.file);

        const { courseData } = req.body;
        const imageFile = req.file;
        
        // Lấy educator ID từ token xác thực
        let educatorId;
        try {
            educatorId = req.auth.userId;
            console.log("Educator ID từ token:", educatorId);
        } catch (authError) {
            console.error("Lỗi lấy educator ID từ token:", authError);
            return res.status(401).json({ success: false, message: 'Không thể xác thực người dùng' });
        }
        
        // Kiểm tra xem có ảnh không
        if (!imageFile) {
            console.log("No thumbnail attached");
            return res.status(400).json({ success: false, message: 'Hình thu nhỏ không được đính kèm' });
        }

        // Parse courseData
        let parsedCourseData;
        try {
            parsedCourseData = JSON.parse(courseData);
            console.log("Parsed course data:", parsedCourseData);
        } catch (parseError) {
            console.error("Lỗi parse JSON:", parseError);
            return res.status(400).json({ success: false, message: 'Dữ liệu khóa học không hợp lệ' });
        }

        // Kiểm tra dữ liệu cơ bản
        if (!parsedCourseData.courseTitle || !parsedCourseData.courseDescription) {
            return res.status(400).json({ success: false, message: 'Thiếu tiêu đề hoặc mô tả khóa học' });
        }

        // Thêm educator ID vào dữ liệu khóa học
        parsedCourseData.educator = educatorId;
        
        // Thêm mảng rỗng cho enrolledStudents nếu chưa có
        if (!parsedCourseData.enrolledStudents) {
            parsedCourseData.enrolledStudents = [];
        }
        
        // Tạo một đối tượng Course mới nhưng chưa lưu
        console.log("Creating course model...");
        const newCourse = new Course(parsedCourseData);
        
        try {
            // Upload ảnh lên Cloudinary trước
            console.log("Uploading image to Cloudinary...");
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                folder: "course_thumbnails",
                resource_type: "image"
            });
            console.log("Image uploaded, URL:", imageUpload.secure_url);
            
            // Cập nhật URL ảnh thumbnail
            newCourse.courseThumbnail = imageUpload.secure_url;

            // Lưu khóa học vào database
            console.log("Saving course to database...");
            await newCourse.save();
            console.log("Course saved successfully with ID:", newCourse._id);

            return res.status(201).json({ 
                success: true, 
                message: 'Khóa học đã được thêm thành công', 
                courseId: newCourse._id 
            });
        } catch (dbError) {
            console.error("Lỗi khi lưu khóa học:", dbError);
            return res.status(500).json({ 
                success: false, 
                message: `Không thể lưu khóa học: ${dbError.message}` 
            });
        }
    } catch (error) {
        console.error("ERROR in addCourse:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Add New Course (Test - No Auth)
export const addCourseTest = async (req, res) => {
    try {
        console.log("=== addCourseTest function called ===");
        console.log("Request body:", req.body);
        console.log("File:", req.file);

        const { courseData, educatorId } = req.body;
        const imageFile = req.file;
        
        // Kiểm tra xem có ảnh không
        if (!imageFile) {
            console.log("No thumbnail attached");
            return res.status(400).json({ success: false, message: 'Hình thu nhỏ không được đính kèm' });
        }

        // Kiểm tra ID của educator
        if (!educatorId) {
            console.log("No educator ID provided");
            return res.status(400).json({ success: false, message: 'Vui lòng cung cấp educatorId' });
        }

        // Parse courseData
        let parsedCourseData;
        try {
            parsedCourseData = JSON.parse(courseData);
            console.log("Parsed course data:", parsedCourseData);
        } catch (parseError) {
            console.error("Lỗi parse JSON:", parseError);
            return res.status(400).json({ success: false, message: 'Dữ liệu khóa học không hợp lệ' });
        }

        // Kiểm tra dữ liệu cơ bản
        if (!parsedCourseData.courseTitle || !parsedCourseData.courseDescription) {
            return res.status(400).json({ success: false, message: 'Thiếu tiêu đề hoặc mô tả khóa học' });
        }

        // Thêm educator ID vào dữ liệu khóa học
        parsedCourseData.educator = educatorId;
        
        // Thêm mảng rỗng cho enrolledStudents nếu chưa có
        if (!parsedCourseData.enrolledStudents) {
            parsedCourseData.enrolledStudents = [];
        }
        
        // Tạo một đối tượng Course mới nhưng chưa lưu
        console.log("Creating course model...");
        const newCourse = new Course(parsedCourseData);
        
        try {
            // Upload ảnh lên Cloudinary trước
            console.log("Uploading image to Cloudinary...");
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                folder: "course_thumbnails",
                resource_type: "image"
            });
            console.log("Image uploaded, URL:", imageUpload.secure_url);
            
            // Cập nhật URL ảnh thumbnail
            newCourse.courseThumbnail = imageUpload.secure_url;

            // Lưu khóa học vào database
            console.log("Saving course to database...");
            await newCourse.save();
            console.log("Course saved successfully with ID:", newCourse._id);

            return res.status(201).json({ 
                success: true, 
                message: 'Khóa học đã được thêm thành công', 
                courseId: newCourse._id 
            });
        } catch (dbError) {
            console.error("Lỗi khi lưu khóa học:", dbError);
            return res.status(500).json({ 
                success: false, 
                message: `Không thể lưu khóa học: ${dbError.message}` 
            });
        }
    } catch (error) {
        console.error("ERROR in addCourseTest:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Delete Course
export const deleteCourse = async (req, res) => {
    console.log("deleteCourse function called");
    console.log("req.params.courseId:", req.params.courseId);
    console.log("req.auth.userId:", req.auth.userId);
    try {
        const courseId = req.params.courseId;
        const educatorId = req.auth.userId;

        // Tìm và xóa khóa học, đảm bảo chỉ người tạo mới có quyền xóa
        const deletedCourse = await Course.findOneAndDelete({ _id: courseId, educator: educatorId });

        if (!deletedCourse) {
            return res.status(404).json({ success: false, message: "Course not found or you don't have permission to delete it" });
        }

        // Xóa ảnh thumbnail trên Cloudinary (nếu cần)
        if (deletedCourse.courseThumbnail) {
            const publicId = deletedCourse.courseThumbnail.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        res.json({ success: true, message: "Khóa học đã được xóa thành công" });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Course
export const updateCourse = async (req, res) => {
    try {
        console.log("=== updateCourse function called ===");
        console.log("Request body:", req.body);
        console.log("File:", req.file);

        const courseId = req.params.courseId;
        const educatorId = req.auth.userId;
        const { courseTitle, courseDescription, coursePrice, discount } = req.body;
        const courseContent = req.body.courseContent ? JSON.parse(req.body.courseContent) : undefined;
        const imageFile = req.file;

        console.log("Course ID:", courseId);
        console.log("Educator ID:", educatorId);

        // Kiểm tra xem khóa học có tồn tại không và thuộc về educator
        const existingCourse = await Course.findOne({ 
            _id: courseId, 
            educator: educatorId 
        });
        
        if (!existingCourse) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy khóa học hoặc bạn không có quyền sửa khóa học này" 
            });
        }

        // Tạo đối tượng updateData
        const updateData = {};
        
        // Chỉ cập nhật các trường được cung cấp
        if (courseTitle) updateData.courseTitle = courseTitle;
        if (courseDescription) updateData.courseDescription = courseDescription;
        if (coursePrice) updateData.coursePrice = Number(coursePrice);
        if (discount) updateData.discount = Number(discount);
        if (courseContent) updateData.courseContent = courseContent;

        // Nếu có file ảnh mới, upload lên Cloudinary
        if (imageFile) {
            try {
                console.log("Uploading new image to Cloudinary...");
                const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                    folder: "course_thumbnails",
                    resource_type: "image"
                });
                console.log("Image uploaded, URL:", imageUpload.secure_url);
                
                // Cập nhật URL ảnh thumbnail mới
                updateData.courseThumbnail = imageUpload.secure_url;
                
                // Xóa ảnh cũ trên Cloudinary nếu có
                if (existingCourse.courseThumbnail) {
                    try {
                        const publicId = existingCourse.courseThumbnail.split('/').pop().split('.')[0];
                        await cloudinary.uploader.destroy(publicId);
                    } catch (deleteError) {
                        console.error("Lỗi khi xóa ảnh cũ:", deleteError);
                    }
                }
            } catch (uploadError) {
                console.error("Lỗi khi upload ảnh:", uploadError);
                return res.status(500).json({ 
                    success: false, 
                    message: `Không thể upload ảnh: ${uploadError.message}` 
                });
            }
        }

        // Cập nhật khóa học
        console.log("Updating course with data:", updateData);
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            updateData,
            { new: true, runValidators: true } // Trả về document đã được cập nhật và validate dữ liệu
        );
        
        console.log("Course updated successfully with ID:", updatedCourse._id);

        return res.status(200).json({ 
            success: true, 
            message: "Khóa học đã được cập nhật thành công", 
            course: updatedCourse 
        });

    } catch (error) {
        console.error("ERROR in updateCourse:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Course (Test - No Auth)
export const updateCourseTest = async (req, res) => {
    try {
        console.log("=== updateCourseTest function called ===");
        console.log("Request body:", req.body);
        console.log("File:", req.file);

        const courseId = req.params.courseId;
        const { courseData, educatorId } = req.body;
        const imageFile = req.file;
        
        if (!courseId) {
            return res.status(400).json({ success: false, message: 'Course ID không hợp lệ' });
        }

        if (!educatorId) {
            return res.status(400).json({ success: false, message: 'Educator ID không hợp lệ' });
        }

        // Parse courseData
        let parsedCourseData;
        try {
            parsedCourseData = JSON.parse(courseData);
            console.log("Parsed course data:", parsedCourseData);
        } catch (parseError) {
            console.error("Lỗi parse JSON:", parseError);
            return res.status(400).json({ success: false, message: 'Dữ liệu khóa học không hợp lệ' });
        }

        // Tạo đối tượng updateData
        const updateData = { ...parsedCourseData };
        
        // Kiểm tra xem khóa học có tồn tại không và thuộc về educator đã chỉ định
        const existingCourse = await Course.findOne({ 
            _id: courseId, 
            educator: educatorId 
        });
        
        if (!existingCourse) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy khóa học hoặc bạn không có quyền sửa khóa học này" 
            });
        }

        // Nếu có file ảnh mới, upload lên Cloudinary
        if (imageFile) {
            try {
                console.log("Uploading new image to Cloudinary...");
                const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                    folder: "course_thumbnails",
                    resource_type: "image"
                });
                console.log("Image uploaded, URL:", imageUpload.secure_url);
                
                // Cập nhật URL ảnh thumbnail mới
                updateData.courseThumbnail = imageUpload.secure_url;
                
                // Xóa ảnh cũ trên Cloudinary nếu có
                if (existingCourse.courseThumbnail) {
                    const publicId = existingCourse.courseThumbnail.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                }
            } catch (uploadError) {
                console.error("Lỗi khi upload ảnh:", uploadError);
                return res.status(500).json({ 
                    success: false, 
                    message: `Không thể upload ảnh: ${uploadError.message}` 
                });
            }
        }

        // Cập nhật khóa học
        console.log("Updating course in database...");
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            updateData,
            { new: true, runValidators: true } // Trả về document đã được cập nhật và validate dữ liệu
        );
        
        console.log("Course updated successfully:", updatedCourse._id);

        return res.status(200).json({ 
            success: true, 
            message: 'Khóa học đã được cập nhật thành công', 
            course: updatedCourse 
        });
    } catch (error) {
        console.error("ERROR in updateCourseTest:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

// Get Course Details
export const getCourseDetails = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const educatorId = req.auth.userId;

        const course = await Course.findOne({ _id: courseId, educator: educatorId });

        if (!course) {
            return res.status(404).json({ success: false, message: "Không tìm thấy khóa học hoặc bạn không có quyền xem khóa học" });
        }

        res.json({ success: true, course });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Educator Courses
export const getEducatorCourses = async (req, res) => {
    try {

        const educator = req.auth.userId

        const courses = await Course.find({ educator })

        res.json({ success: true, courses })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Educator Dashboard Data ( Total Earning, Enrolled Students, No. of Courses)
export const educatorDashboardData = async (req, res) => {
    try {
        const educator = req.auth.userId;

        const courses = await Course.find({ educator });

        const totalCourses = courses.length;

        const courseIds = courses.map(course => course._id);

        // Calculate total earnings from purchases
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        });

        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

        // Collect unique enrolled student IDs with their course titles
        const enrolledStudentsData = [];
        for (const course of courses) {
            const students = await User.find({
                _id: { $in: course.enrolledStudents }
            }, 'name imageUrl');

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            });
        }

        res.json({
            success: true,
            dashboardData: {
                totalEarnings,
                enrolledStudentsData,
                totalCourses
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Enrolled Students Data with Purchase Data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educator = req.auth.userId;

        // Fetch all courses created by the educator
        const courses = await Course.find({ educator });

        // Get the list of course IDs
        const courseIds = courses.map(course => course._id);

        // Fetch purchases with user and course data
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle');

        // enrolled students data
        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }));

        res.json({
            success: true,
            enrolledStudents
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};

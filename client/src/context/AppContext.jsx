import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth, useUser } from "@clerk/clerk-react";
import humanizeDuration from "humanize-duration";


const vietnameseLanguage = {
    language: 'vi', // Mã ngôn ngữ (ISO 639-1)
    y: (c) => c === 1 ? 'năm' : 'năm',       // Năm
    mo: (c) => c === 1 ? 'tháng' : 'tháng',     // Tháng
    w: (c) => c === 1 ? 'tuần' : 'tuần',       // Tuần
    d: (c) => c === 1 ? 'ngày' : 'ngày',       // Ngày
    h: (c) => c === 1 ? 'giờ' : 'giờ',       // Giờ
    m: (c) => c === 1 ? 'phút' : 'phút',       // Phút
    s: (c) => c === 1 ? 'giây' : 'giây',       // Giây
    ms: (c) => c === 1 ? 'mili giây' : 'mili giây', // Mili giây
    decimal: ',',       // Dấu phân cách thập phân (ví dụ: ',' hoặc '.')
    spacer: ' ',         // Dấu cách giữa số và đơn vị (ví dụ: ' ')
    delimiter: ', ',     // Dấu phân cách giữa các đơn vị (ví dụ: ', ')
    _numberFirst: false // Có hiển thị số trước đơn vị không (true/false)
};


const humanizer = humanizeDuration.humanizer({
    language: 'vi',
    languages: {
        vi: vietnameseLanguage
    }
});


export const AppContext = createContext()

export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const currency = import.meta.env.VITE_CURRENCY

    const navigate = useNavigate()
    const { getToken } = useAuth()
    const { user } = useUser()

    const [showLogin, setShowLogin] = useState(false)
    const [isEducator,setIsEducator] = useState(false)
    const [allCourses, setAllCourses] = useState([])
    const [userData, setUserData] = useState(null)
    const [enrolledCourses, setEnrolledCourses] = useState([])

    // Fetch All Courses
    const fetchAllCourses = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/course/all');

            if (data.success) {
                setAllCourses(data.courses)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }

    }

    // Fetch UserData 
    const fetchUserData = async () => {
        try {
            // Make sure user exists before accessing its properties
            if (!user) {
                console.log("User not loaded yet, skipping fetchUserData");
                return;
            }

            // Check if user has publicMetadata and it contains role property
            if (user.publicMetadata && user.publicMetadata.role === 'educator') {
                setIsEducator(true)
            }

            const token = await getToken();
            
            if (!token) {
                console.log("Token not available yet, skipping fetchUserData");
                return;
            }

            const { data } = await axios.get(backendUrl + '/api/user/data',
                { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                setUserData(data.user)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.error("Error fetching user data:", error);
            // Don't show toast error on page refresh/initial load
            if (error.message !== "Cannot read properties of null (reading 'publicMetadata')") {
                toast.error(error.message)
            }
        }
    }

    // Fetch User Enrolled Courses
    const fetchUserEnrolledCourses = async () => {
        try {
            // Make sure user exists before trying to fetch courses
            if (!user) {
                console.log("User not loaded yet, skipping fetchUserEnrolledCourses");
                return;
            }

            const token = await getToken();
            
            if (!token) {
                console.log("Token not available yet, skipping fetchUserEnrolledCourses");
                return;
            }

            const { data } = await axios.get(backendUrl + '/api/user/enrolled-courses',
                { headers: { Authorization: `Bearer ${token}` } })

            if (data.success) {
                setEnrolledCourses(data.enrolledCourses.reverse())
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.error("Error fetching enrolled courses:", error);
            // Only show toast for non-auth related errors
            if (!error.message.includes("Cannot read properties of null")) {
                toast.error(error.message)
            }
        }
    }

    // Function to Calculate Course Chapter Time
    const calculateChapterTime = (chapter) => {

        let time = 0

        chapter.chapterContent.map((lecture) => time += lecture.lectureDuration)

        return humanizer(time * 60 * 1000, { units: ["h", "m"] })

    }

    // Function to Calculate Course Duration
    const calculateCourseDuration = (course) => {

        let time = 0

        course.courseContent.map(
            (chapter) => chapter.chapterContent.map(
                (lecture) => time += lecture.lectureDuration
            )
        )

        return humanizer(time * 60 * 1000, { 
            units: ["h", "m"], 
        });

    }

    const calculateRating = (course) => {

        if (course.courseRatings.length === 0) {
            return 0
        }

        let totalRating = 0
        course.courseRatings.forEach(rating => {
            totalRating += rating.rating
        })
        return Math.floor(totalRating / course.courseRatings.length)
    }

    const calculateNoOfLectures = (course) => {
        let totalLectures = 0;
        course.courseContent.forEach(chapter => {
            if (Array.isArray(chapter.chapterContent)) {
                totalLectures += chapter.chapterContent.length;
            }
        });
        return totalLectures;
    }


    useEffect(() => {
        fetchAllCourses()
    }, [])

    // Fetch User's Data if User is Logged In
    useEffect(() => {
        if (user) {
            fetchUserData()
            fetchUserEnrolledCourses()
        }
    }, [user])

    const value = {
        showLogin, setShowLogin,
        backendUrl, currency, navigate,
        userData, setUserData, getToken,
        allCourses, fetchAllCourses,
        enrolledCourses, fetchUserEnrolledCourses,
        calculateChapterTime, calculateCourseDuration,
        calculateRating, calculateNoOfLectures,
        isEducator,setIsEducator
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

import React, { useContext, useEffect, useState } from 'react';
import Footer from '../../components/student/Footer';
import { assets } from '../../assets/assets';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import humanizeDuration from 'humanize-duration'
import YouTube from 'react-youtube';
import { useAuth } from '@clerk/clerk-react';
import Loading from '../../components/student/Loading';


const vietnameseLanguage = {
  language: 'vi',
  y: (c) => c === 1 ? 'năm' : 'năm',
  mo: (c) => c === 1 ? 'tháng' : 'tháng',
  w: (c) => c === 1 ? 'tuần' : 'tuần',
  d: (c) => c === 1 ? 'ngày' : 'ngày',
  h: (c) => c === 1 ? 'giờ' : 'giờ',
  m: (c) => c === 1 ? 'phút' : 'phút',
  s: (c) => c === 1 ? 'giây' : 'giây',
  ms: (c) => c === 1 ? 'mili giây' : 'mili giây',
  decimal: ',',
  spacer: ' ',
  delimiter: ', ',
  _numberFirst: false
};

const humanizer = humanizeDuration.humanizer({
  language: 'vi',
  languages: {
      vi: vietnameseLanguage
  }
});
const CourseDetails = () => {

  const { id } = useParams()

  const [courseData, setCourseData] = useState(null)
  const [playerData, setPlayerData] = useState(null)
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false)

  const { backendUrl, currency, userData, calculateChapterTime, calculateCourseDuration, calculateRating, calculateNoOfLectures, setShowLogin } = useContext(AppContext)
  const { getToken, isSignedIn, userId } = useAuth()


  const fetchCourseData = async () => {

    try {

      const { data } = await axios.get(backendUrl + '/api/course/' + id)

      if (data.success) {
        setCourseData(data.courseData)
      } else {
        toast.error(data.message)
      }

    } catch (error) {

      toast.error(error.message)

    }

  }

  const [openSections, setOpenSections] = useState({});

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };


  const enrollCourse = async () => {
    try {
      // Kiểm tra xác thực Clerk
      if (!isSignedIn || !userId) {
        setShowLogin(true); // Hiện modal đăng nhập nếu có
        return toast.warn('Vui lòng đăng nhập để đăng ký khóa học');
      }

      // Nếu userData chưa được tải nhưng người dùng đã đăng nhập với Clerk, thử tải lại dữ liệu
      if (!userData && isSignedIn) {
        console.log("Người dùng đã đăng nhập nhưng userData chưa tải, đang tải dữ liệu người dùng");
        try {
          const token = await getToken();
          const { data } = await axios.get(backendUrl + '/api/user/data',
            { headers: { Authorization: `Bearer ${token}` } });
          
          if (data.success) {
            // Kiểm tra xem đã đăng ký khóa học chưa sau khi tải dữ liệu
            if (data.user.enrolledCourses && data.user.enrolledCourses.includes(courseData._id)) {
              setIsAlreadyEnrolled(true);
              return toast.warn('Bạn đã đăng ký khóa học này rồi');
            }
          }
        } catch (error) {
          console.error("Lỗi khi tải dữ liệu người dùng:", error);
        }
      }

      if (isAlreadyEnrolled) {
        return toast.warn('Bạn đã đăng ký khóa học này rồi');
      }

      const token = await getToken();

      // Hiển thị thông báo đang xử lý
      const loadingToast = toast.loading('Đang xử lý đăng ký...');

      const { data } = await axios.post(backendUrl + '/api/user/purchase',
        { courseId: courseData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Tắt thông báo đang xử lý
      toast.dismiss(loadingToast);

      if (data.success) {
        const { session_url } = data;
        window.location.replace(session_url);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message || 'Đã xảy ra lỗi trong quá trình đăng ký');
    }
  }

  useEffect(() => {
    fetchCourseData()
  }, [])

  useEffect(() => {

    if (userData && courseData && userData.enrolledCourses) {
      setIsAlreadyEnrolled(userData.enrolledCourses.includes(courseData._id))
    }

  }, [userData, courseData])

  return courseData ? (
    <>
      <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-20 pt-10 text-left">
        <div className="absolute top-0 left-0 w-full h-section-height -z-1 bg-gradient-to-b from-cyan-100/70"></div>

        <div className="max-w-xl z-10 text-gray-500">
          <h1 className="md:text-course-deatails-heading-large text-course-deatails-heading-small font-semibold text-gray-800">
            {courseData.courseTitle}
          </h1>
          <p className="pt-4 md:text-base text-sm" dangerouslySetInnerHTML={{ __html: courseData.courseDescription.slice(0, 200) }}>
          </p>

          <div className='flex items-center space-x-2 pt-3 pb-1 text-sm'>
            <p>{calculateRating(courseData)}</p>
            <div className='flex'>
              {[...Array(5)].map((_, i) => (<img key={i} src={i < Math.floor(calculateRating(courseData)) ? assets.star : assets.star_blank} alt=''
                className='w-3.5 h-3.5' />
              ))}
            </div>
            <p className='text-blue-600'>({courseData.courseRatings.length} {courseData.courseRatings.length > 1 ? 'Đánh giá' : 'Đánh giá'})</p>

            <p>{courseData.enrolledStudents.length} {courseData.enrolledStudents.length > 1 ? 'Sinh Viên' : 'Sinh viên'}</p>
          </div>

          <p className='text-sm'>Khóa học của <span className='text-blue-600 underline'>{courseData.educator && courseData.educator.name ? courseData.educator.name : "Unknown Educator"}</span></p>

          <div className="pt-8 text-gray-800">
            <h2 className="text-xl font-semibold">Cấu trúc khóa học</h2>
            <div className="pt-5">
              {courseData.courseContent.map((chapter, index) => (
                <div key={index} className="border border-gray-300 bg-white mb-2 rounded">
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-2">
                      <img src={assets.down_arrow_icon} alt="arrow icon" className={`transform transition-transform ${openSections[index] ? "rotate-180" : ""}`} />
                      <p className="font-medium md:text-base text-sm">{chapter.chapterTitle}</p>
                    </div>
                    <p className="text-sm md:text-default">{chapter.chapterContent.length} bài học - {calculateChapterTime(chapter)}</p>
                  </div>

                  <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? "max-h-96" : "max-h-0"}`} >
                    <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                      {chapter.chapterContent.map((lecture, i) => (
                        <li key={i} className="flex items-start gap-2 py-1">
                          <img src={assets.play_icon} alt="bullet icon" className="w-4 h-4 mt-1" />
                          <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                            <p>{lecture.lectureTitle}</p>
                            <div className='flex gap-2'>
                              {lecture.isPreviewFree && <p onClick={() => setPlayerData({
                                videoId: lecture.lectureUrl.split('/').pop()
                              })} className='text-blue-500 cursor-pointer'>Preview</p>}
                              <p>{humanizer(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'] })}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="py-20 text-sm md:text-default">
            <h3 className="text-xl font-semibold text-gray-800">Mô tả khóa học</h3>
            <p className="rich-text pt-3" dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}>
            </p>
          </div>
        </div>

        <div className="max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]">
          {
            playerData
              ? <YouTube videoId={playerData.videoId} opts={{ playerVars: { autoplay: 1 } }} iframeClassName='w-full aspect-video' />
              : <img src={courseData.courseThumbnail} alt="" />
          }
          <div className="p-5">
            <div className="flex items-center gap-2">
              <img className="w-3.5" src={assets.time_left_clock_icon} alt="time left clock icon" />
              <p className="text-red-500">
                <span className="font-medium">5 ngày</span> cuối với mức giá ưu đãi này!
              </p>
            </div>
            <div className="flex gap-3 items-center pt-2">
              <p className="text-gray-800 md:text-4xl text-2xl font-semibold">{currency}{(courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)}</p>
              <p className="md:text-lg text-gray-500 line-through">{currency}{courseData.coursePrice}</p>
              <p className="md:text-lg text-gray-500"> Giảm {courseData.discount} %</p>
            </div>
            <div className="flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500">
              <div className="flex items-center gap-1">
                <img src={assets.star} alt="star icon" />
                <p>{calculateRating(courseData)}</p>
              </div>
              <div className="h-4 w-px bg-gray-500/40"></div>
              <div className="flex items-center gap-1">
                <img src={assets.time_clock_icon} alt="clock icon" />
                <p>{calculateCourseDuration(courseData)}</p>
              </div>
              <div className="h-4 w-px bg-gray-500/40"></div>
              <div className="flex items-center gap-1">
                <img src={assets.lesson_icon} alt="clock icon" />
                <p>{calculateNoOfLectures(courseData)} bài học</p>
              </div>
            </div>
            <button onClick={enrollCourse} className="md:mt-6 mt-4 w-full py-3 rounded bg-blue-600 text-white font-medium">
              {isAlreadyEnrolled ? "Đã đăng ký" : "Đăng ký ngay"}
            </button>
            <div className="pt-6">
              {/* <p className="md:text-xl text-lg font-medium text-gray-800">Có gì trong khóa học này?</p>
              <ul className="ml-4 pt-2 text-sm md:text-default list-disc text-gray-500">
                <li>Lifetime access with free updates.</li>
                <li>Step-by-step, hands-on project guidance.</li>
                <li>Downloadable resources and source code.</li>
                <li>Quizzes to test your knowledge.</li>
                <li>Certificate of completion.</li>
              </ul> */}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  ) : <Loading />
};

export default CourseDetails;
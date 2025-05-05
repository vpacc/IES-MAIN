import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import YouTube from 'react-youtube';
import { assets } from '../../assets/assets';
import { useParams } from 'react-router-dom';
import humanizeDuration from 'humanize-duration';
import axios from 'axios';
import { toast } from 'react-toastify';
import Rating from '../../components/student/Rating';
import Footer from '../../components/student/Footer';
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
const Player = ({ }) => {

  const { enrolledCourses, backendUrl, getToken, calculateChapterTime, userData, fetchUserEnrolledCourses } = useContext(AppContext)

  const { courseId } = useParams()
  const [courseData, setCourseData] = useState(null)
  const [progressData, setProgressData] = useState(null)
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [initialRating, setInitialRating] = useState(0);

  const getCourseData = () => {
    enrolledCourses.map((course) => {
      if (course._id === courseId) {
        setCourseData(course)
        course.courseRatings.map((item) => {
          if (item.userId === userData._id) {
            setInitialRating(item.rating)
          }
        })
      }
    })
  }

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };


  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseData()
    }
  }, [enrolledCourses])

  const markLectureAsCompleted = async (lectureId) => {

    try {

      const token = await getToken()

      const { data } = await axios.post(backendUrl + '/api/user/update-course-progress',
        { courseId, lectureId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success(data.message)
        getCourseProgress()
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }

  }

  const getCourseProgress = async () => {

    try {

      const token = await getToken()

      const { data } = await axios.post(backendUrl + '/api/user/get-course-progress',
        { courseId },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        setProgressData(data.progressData)
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }

  }

  const handleRate = async (rating) => {

    try {

      const token = await getToken()

      const { data } = await axios.post(backendUrl + '/api/user/add-rating',
        { courseId, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (data.success) {
        toast.success(data.message)
        fetchUserEnrolledCourses()
      } else {
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {

    getCourseProgress()

  }, [])

  return courseData ? (
    <>
    
    <div className='p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36' >
      <div className=" text-gray-800" >
        <h2 className="text-xl font-semibold">Cấu trúc khóa học</h2>
        <div className="pt-5">
          {courseData && courseData.courseContent.map((chapter, index) => (
            <div key={index} className="border border-gray-300 bg-white mb-2 rounded">
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                onClick={() => toggleSection(index)}
              >
                <div className="flex items-center gap-2">
                  <img src={assets.down_arrow_icon} alt="arrow icon" className={`transform transition-transform ${openSections[index] ? "rotate-180" : ""}`} />
                  <p className="font-medium md:text-base text-sm">{chapter.chapterTitle}</p>
                </div>
                <p className="text-sm md:text-default">{chapter.chapterContent.length} bài giảng - {calculateChapterTime(chapter)}</p>
              </div>

              <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? "max-h-96" : "max-h-0"}`} >
                <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                  {chapter.chapterContent.map((lecture, i) => (
                    <li key={i} className="flex items-start gap-2 py-1">
                      <img src={progressData && progressData.lectureCompleted.includes(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon} alt="bullet icon" className="w-4 h-4 mt-1" />
                      <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                        <p>{lecture.lectureTitle}</p>
                        <div className='flex gap-2'>
                          {lecture.lectureUrl && <p onClick={() => setPlayerData({ ...lecture, chapter: index + 1, lecture: i + 1 })} className='text-blue-500 cursor-pointer'>Xem</p>}
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

        <div className=" flex items-center gap-2 py-3 mt-10">
          <h1 className="text-xl font-bold">Đánh giá khóa học này:</h1>
          <Rating initialRating={initialRating} onRate={handleRate} />
        </div>

      </div>
   
  
      <div className='md:mt-10'>
  {playerData ? (
    
    <div>
      <div 
        className="relative cursor-pointer bg-gray-200 aspect-video"
        onClick={() => {
          // Xử lý trích xuất video ID từ các định dạng URL khác nhau
          const getVideoId = (url) => {
            const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu.be\/([^?]+)/);
            return match ? match[1] : null;
          };
          
          const videoId = getVideoId(playerData.lectureUrl);
          if (videoId) {
            window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
          }
        }}
      >
        {/* Hiển thị thumbnail video */}
        <img 
          src={`https://img.youtube.com/vi/${playerData.lectureUrl.split('v=')[1]}/0.jpg`} 
          alt="Video thumbnail" 
          className="w-full h-full object-cover"
        />
        {/* Nút play overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-20 h-20 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>

      <div className="flex justify-between items-center mt-1">
        <p className="text-xl">{playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}</p>
        <button 
          onClick={() => markLectureAsCompleted(playerData.lectureId)} 
          className="text-blue-600"
        >
          {progressData?.lectureCompleted?.includes(playerData.lectureId) ? 'Hoàn thành' : 'Đánh dấu hoàn thành'}
        </button>
      </div>
    </div>
  ) : (
    <img src={courseData?.courseThumbnail || ''} alt="" />
  )}
</div>

    </div>
    <Footer />
    </>
  ) : <Loading />
}

export default Player
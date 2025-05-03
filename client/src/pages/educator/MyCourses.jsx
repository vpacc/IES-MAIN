import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loading from '../../components/student/Loading';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
const MyCourses = () => {

    const { backendUrl, isEducator, currency, getToken } = useContext(AppContext)

    const [courses, setCourses] = useState(null)
    const [loading, setLoading] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const navigate = useNavigate();

    const fetchEducatorCourses = async () => {
        setLoading(true);
        try {
            const token = await getToken()
            const { data } = await axios.get(backendUrl + '/api/educator/courses', { headers: { Authorization: `Bearer ${token}` } })
            if (data.success) {
                setCourses(data.courses)
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false);
        }
    }

    const handleDeleteCourse = (courseId) => {
        setCourseToDelete(courseId);
        setShowDeleteModal(true);
    };

    const confirmDeleteCourse = async () => {
        setShowDeleteModal(false);
        if (!courseToDelete) return;

        try {
            const token = await getToken();
            const { data } = await axios.delete(`${backendUrl}/api/educator/courses/${courseToDelete}`, { // URL SỬA Ở ĐÂY
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                toast.success(data.message);
                fetchEducatorCourses();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Error deleting course:", error);
            toast.error(error.message);
        } finally {
            setCourseToDelete(null);
        }
    };

    const cancelDeleteCourse = () => {
        setShowDeleteModal(false);
        setCourseToDelete(null);
    };


    const handleEditCourse = (courseId) => {
      navigate(`/educator/courses/edit/${courseId}`); // Chuyển hướng đến trang EditCourse
  };


    useEffect(() => {
        if (isEducator) {
            fetchEducatorCourses()
        }
    }, [isEducator])

    return loading ? (
        <Loading />
    ) : courses ? (
        <div className="h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0 relative">
            <div className='w-full'>
                <h2 className="pb-4 text-lg font-medium">Các khóa học của tôi</h2>
                <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
                    <table className="md:table-auto table-fixed w-full overflow-hidden">
                        <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
                            <tr>
                                <th className="px-4 py-3 font-semibold truncate">Tất cả các khóa học</th>
                                <th className="px-4 py-3 font-semibold truncate">Thu nhập</th>
                                <th className="px-4 py-3 font-semibold truncate">Sinh viên</th>
                                <th className="px-4 py-3 font-semibold truncate">Ngày xuất bản</th>
                                <th className="px-4 py-3 font-semibold truncate">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-500">
                            {courses.map((course) => (
                                <tr key={course._id} className="border-b border-gray-500/20">
                                    <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                                        <img src={course.courseThumbnail} alt="Course Image" className="w-16" />
                                        <span className="truncate hidden md:block">{course.courseTitle}</span>
                                    </td>
                                    <td className="px-4 py-3">{currency} {Math.floor(course.enrolledStudents.length * (course.coursePrice - course.discount * course.coursePrice / 100))}</td>
                                    <td className="px-4 py-3">{course.enrolledStudents.length}</td>
                                    <td className="px-4 py-3">
                                        {new Date(course.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                    <button
                                            onClick={() => handleDeleteCourse(course._id)}
                                            className="cursor-pointer text-lg text-red-500 hover:underline pl-0 pr-4">Xóa</button>
                                        <span className='text-lg'>|</span>
                                        <button
                                            onClick={() => handleEditCourse(course._id)}
                                            className="cursor-pointer text-lg text-blue-500 hover:underline px-4">Chỉnh sửa</button>
                                        
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative p-5 bg-white rounded-lg max-w-md w-full">
                        <div className="mt-3 text-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Xác nhận Xóa khóa học
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                Bạn có chắc chắn muốn xóa khóa học này không? Hành động này không thể hoàn tác.
                                </p>
                            </div>
                        </div>
                        <div className="items-center justify-end mt-4 flex">
                            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded mr-2" onClick={cancelDeleteCourse}>
                            Hủy 
                            </button>
                            <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={confirmDeleteCourse}>
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    ) : <Loading />;
};

export default MyCourses;
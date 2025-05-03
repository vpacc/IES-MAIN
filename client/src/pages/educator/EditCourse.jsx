import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../../context/AppContext';


const EditCourse = () => {
    const { backendUrl, getToken } = useContext(AppContext);
    const { courseId } = useParams();
    const navigate = useNavigate();

    const [courseTitle, setCourseTitle] = useState('');
    const [courseDescription, setCourseDescription] = useState('');
    const [coursePrice, setCoursePrice] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [image, setImage] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            setLoading(true);
            try {
                const token = await getToken();
                const { data } = await axios.get(`${backendUrl}/api/educator/courses/${courseId}`, { // SỬA URL
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (data && data.success) { // KIỂM TRA DATA
                    const course = data.course;
                    const plainTextDescription = course.courseDescription ? course.courseDescription.replace(/<[^>]*>/g, '') : '';
                    setCourseTitle(course.courseTitle);
                    setCourseDescription(plainTextDescription);
                    setCoursePrice(course.coursePrice);
                    setDiscount(course.discount);
                    setChapters(course.courseContent);
                    setImage(course.courseThumbnail);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                console.error("Error fetching course:", error); // LOG LỖI
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId, backendUrl, getToken]);

    const handleChapterChange = (chapterIndex, field, value, lectureIndex = null, lectureField = null) => {
        const newChapters = [...chapters];
        if (lectureIndex === null) {
            // Thay đổi thông tin của chapter
            newChapters[chapterIndex] = { ...newChapters[chapterIndex], [field]: value };
        } else {
            // Thay đổi thông tin của lecture
            const newLectures = [...newChapters[chapterIndex].chapterContent];
            newLectures[lectureIndex] = { ...newLectures[lectureIndex], [lectureField]: value };
            newChapters[chapterIndex] = { ...newChapters[chapterIndex], chapterContent: newLectures.sort((a, b) => a.lectureOrder - b.lectureOrder) };
        }
        setChapters(newChapters.sort((a, b) => a.chapterOrder - b.chapterOrder));
    };

    const handleAddChapter = () => {
        const newChapter = {
            chapterId: Date.now().toString(),
            chapterTitle: '',
            chapterOrder: chapters.length + 1,
            chapterContent: []
        };
        setChapters([...chapters, newChapter]);
    };

    const handleRemoveChapter = (chapterIndex) => {
        const newChapters = chapters.filter((_, i) => i !== chapterIndex).map((chapter, index) => ({ ...chapter, chapterOrder: index + 1 }));
        setChapters(newChapters);
    };

    const handleAddLecture = (chapterIndex) => {
        const newLecture = {
            lectureId: Date.now().toString(),
            lectureTitle: '',
            lectureDuration: 0,
            lectureUrl: '',
            isPreviewFree: false,
            lectureOrder: chapters[chapterIndex].chapterContent.length + 1
        };
        const newChapters = [...chapters];
        newChapters[chapterIndex] = {
            ...newChapters[chapterIndex],
            chapterContent: [...newChapters[chapterIndex].chapterContent, newLecture]
        };
        setChapters(newChapters);
    };

    const handleRemoveLecture = (chapterIndex, lectureIndex) => {
        const newLectures = chapters[chapterIndex].chapterContent.filter((_, i) => i !== lectureIndex).map((lecture, index) => ({ ...lecture, lectureOrder: index + 1 }));
        const newChapters = [...chapters];
        newChapters[chapterIndex] = { ...newChapters[chapterIndex], chapterContent: newLectures };
        setChapters(newChapters);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await getToken();
            const formData = new FormData();
            formData.append('courseTitle', courseTitle);
            formData.append('courseDescription', courseDescription);
            formData.append('coursePrice', coursePrice);
            formData.append('discount', discount);
            formData.append('courseContent', JSON.stringify(chapters));
            
            if (image instanceof File) { // KIỂM TRA FILE
                formData.append('image', image);
            }
            
            // Sửa lại đường dẫn API - Bỏ phần /api/educator/ ở đầu vì đã được đặt trong backendUrl
            const { data } = await axios.patch(`${backendUrl}/api/educator/courses/${courseId}`, formData, { 
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            
            if (data && data.success) { // KIỂM TRA DATA
                toast.success(data.message);
                navigate('/educator/my-courses');
            } else {
                toast.error(data.message || 'Không thể cập nhật khóa học');
            }
        } catch (error) {
            console.error("Error updating course:", error); // LOG LỖI
            toast.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra');
        }
    };

    return (
        <div className='h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4 max-w-md w-full text-gray-500'>
                <div className='flex flex-col gap-1'>
                    <p className='text-lg underline text-black' style={{ fontWeight: 700 }}>Tên khóa học:</p>
                    <input
                        type="text"
                        className="mt-1 block w-full border rounded py-1 px-2"
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                    />
                </div>
                <div className='flex flex-col gap-1'>
                    <p className='text-lg underline text-black' style={{ fontWeight: 700 }}>Mô tả khóa học:</p>
                    <textarea
                        className="mt-1 block w-full border rounded py-1 px-2"
                        value={courseDescription}
                        onChange={(e) => setCourseDescription(e.target.value)}
                    />
                </div>
                <div className='flex flex-col gap-1'>
                    <p className='text-lg underline text-black' style={{ fontWeight: 700 }}>Giá khóa học:</p>
                    <input
                        type="number"
                        className="mt-1 block w-full border rounded py-1 px-2"
                        value={coursePrice}
                        onChange={(e) => setCoursePrice(e.target.value)}
                    />
                </div>
                <div className='flex flex-col gap-1'>
                    <p className='text-lg underline text-black' style={{ fontWeight: 700 }}>Giảm giá:</p>
                    <input
                        type="number"
                        className="mt-1 block w-full border rounded py-1 px-2"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                    />
                </div>
                <div className='flex flex-col gap-1'>
                    <p className='text-lg underline text-black' style={{ fontWeight: 700 }}>Ảnh:</p>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                    />
                    {image ? (typeof image === 'string' ? <img src={image} alt="Course Thumbnail" /> : <img src={URL.createObjectURL(image)} alt="Course Thumbnail" />) : null}
                </div>

                 {/* Chapters */}
                 <div className='flex flex-col gap-4'>
                    <p className='text-xl font-semibold text-gray-700 underline' >Chương: </p>
                    {chapters.map((chapter, chapterIndex) => (
                        <div key={chapter.chapterId} className="border p-4 rounded mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <input
                                    type="text"
                                    value={chapter.chapterTitle}
                                    onChange={(e) => handleChapterChange(chapterIndex, 'chapterTitle', e.target.value)}
                                    placeholder="Tiêu đề chương"
                                    className="border rounded py-1 px-2 w-3/4"
                                />
                                <button type="button" onClick={() => handleRemoveChapter(chapterIndex)} className="bg-red-500 text-white py-1 px-2 rounded">
                                    Xóa chương
                                </button>
                            </div>

                            {/* Lectures */}
                            {chapter.chapterContent.map((lecture, lectureIndex) => (
                                <div key={lecture.lectureId} className="border p-2 rounded mb-2">
                                    <input
                                        type="text"
                                        name="lectureTitle"
                                        value={lecture.lectureTitle}
                                        onChange={(e) => handleChapterChange(chapterIndex, 'lectureTitle', e.target.value, lectureIndex, 'lectureTitle')}
                                        placeholder="Tiêu đề bài giảng"
                                        className="border rounded py-1 px-2 mr-2"
                                    />
                                    <input
                                        type="number"
                                        name="lectureDuration"
                                        value={lecture.lectureDuration}
                                        onChange={(e) => handleChapterChange(chapterIndex, 'lectureDuration', parseFloat(e.target.value), lectureIndex, 'lectureDuration')}
                                        placeholder="Thời lượng (phút)"
                                        className="border rounded py-1 px-2 mr-2 w-20"
                                    />
                                    <input
                                        type="text"
                                        name="lectureUrl"
                                        value={lecture.lectureUrl}
                                        onChange={(e) => handleChapterChange(chapterIndex, 'lectureUrl', e.target.value, lectureIndex, 'lectureUrl')}
                                        placeholder="URL bài giảng"
                                        className="border rounded py-1 px-2 mr-2 w-40"
                                    />
                                    <label className="inline-flex items-center mr-2">
                                        <input
                                            type="checkbox"
                                            name="isPreviewFree"
                                            checked={lecture.isPreviewFree}
                                            onChange={(e) => handleChapterChange(chapterIndex, 'isPreviewFree', e.target.checked, lectureIndex, 'isPreviewFree')}
                                            className="form-checkbox h-4 w-4 text-indigo-600"
                                        />
                                        <span className="ml-2 text-gray-700">Xem trước</span>
                                    </label>
                                    <button type="button" onClick={() => handleRemoveLecture(chapterIndex, lectureIndex)} className="bg-red-500 text-white py-1 px-2 rounded">
                                        Xóa
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => handleAddLecture(chapterIndex)} className="bg-blue-500 text-white py-2 px-4 rounded mt-2">
                                Thêm bài giảng
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddChapter} className="bg-green-500 text-white py-2 px-4 rounded">
                        Thêm chương
                    </button>
                </div>

                <button type="submit" className='bg-black text-white w-max py-2.5 px-8 rounded my-4'>
                    Lưu thay đổi
                </button>
            </form>
        </div>
    );
};

export default EditCourse;
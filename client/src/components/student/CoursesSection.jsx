import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import CourseCard from './CourseCard';
import { Link } from 'react-router-dom';

const CoursesSection = () => {

  const { allCourses } = useContext(AppContext)

  return (
    <div className="py-16 md:px-40 px-8">
      <h2 className="text-3xl font-medium text-gray-800">Học hỏi từ những người giỏi nhất</h2>
      <p className='text-sm md:text-base text-gray-500 mt-3'>Khám phá các khóa học được đánh giá cao nhất của chúng tôi trong nhiều danh mục khác nhau. Từ cơ bản đến nâng cao, <br/>các khóa học của chúng tôi được thiết kế để mang lại nguồn kiến thức tiếng Hàn to lớn</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-4 md:px-0 md:my-16 my-10 gap-4">
        {allCourses.slice(0, 4).map((course, index) => <CourseCard key={index} course={course} />)}
      </div>
      <Link to={'/course-list'} onClick={() => scrollTo(0, 0)} className="text-gray-500 border border-gray-500/30 px-10 py-3 rounded">Tất cả khóa học</Link>
    </div>
  );
};

export default CoursesSection;

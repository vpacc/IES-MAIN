import React from 'react'
import { assets } from '../../assets/assets'
import SearchBar from './SearchBar'

const Hero = () => {
  return (
    <div className='flex flex-col items-center justify-center w-full md:pt-0 pt-20 px-7 md:px-0 space-y-7
     text-center bg-gradient-to-b from-cyan-100/70'>
      <img src="https://duhocies.edu.vn/wp-content/uploads/2021/11/IES.png" 
      alt="" className="w-full h-auto mt-4 rounded-xl shadow-md"
      />
      <h1 className='md:text-home-heading-large text-home-heading-small relative font-bold
       text-gray-800 max-w-3x1 mx:auto'>Trao quyền cho tương lai của bạn với các khóa học được thiết kế 
      </h1>
      <h2 className='md:text-home-heading-large text-home-heading-small relative font-bold
       text-gray-800 max-w-3x1 mx:auto'><span className='text-blue-600'
        > phù hợp với sự lựa chọn của bạn </span> <img src={assets.sketch} alt="sketch" 
        className='md:block hidden absolute -bottom-7 right-0'/></h2>
      <p className='md:block hidden text-gray-500 max-w-2x1 mx-auto'>
      Chúng tôi tập hợp các giảng viên đẳng cấp thế giới, nội dung tương tác và cộng đồng hỗ trợ để giúp bạn đạt được mục tiêu cá nhân và nghề nghiệp của mình</p>
      <p className='md:hidden text-gray-500 max-w-sm mx-auto'>Chúng tôi tập hợp những giảng viên đẳng cấp thế giới để giúp bạn đạt được mục tiêu nghề nghiệp của mình</p>
      <SearchBar />
    </div>
  )
}

export default Hero;

import React from 'react'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <footer className='bg-gray-900 md:px-36 text-left w-full mt-10'>
      <div className='flex flex-col md:flex-row items-start px-8 md:px-0 justify-center gap-10 md:gap-32 py-10 border-b border-white/30'>
        <div className='flex flex-col md:items-start items-center w-full'>
          <img src={assets.logo} alt="logo" className="w-28 h-auto" />
          <p className='mt-6 text-center md:text-left text-lg text-white/80'>Du học Hàn Quốc IES</p>
          <p className='mt-6 text-center md:text-left text-sm text-white/80'>-Chuyên đào tạo và tư vấn du học Hàn Quốc</p>
          <p className='mt-6 text-center md:text-left text-sm text-white/80'>-Chi phí minh bạch</p>
          <p className='mt-6 text-center md:text-left text-sm text-white/80'>-Tỷ lệ Visa 99%</p>
          <p className='mt-6 text-center md:text-left text-sm text-white/80'>-Email: <span onClick={() => window.open('https://mail.google.com/mail/u/0/?fs=1&tf=cm&source=mailto&to=iesolution.edu@gmail.com', '_blank')} style={{ cursor: 'pointer' }} className='underline'>
          iesolution.edu@gmail.com
  </span>
</p>
          <p className='mt-6 text-center md:text-left text-sm text-white/80'>-Địa chỉ: <span onClick={() => window.open('https://www.google.com/maps/place/HÀN+NGỮ+IES/@21.0756659,105.7006873,17z/data=!3m1!4b1!4m6!3m5!1s0x31345591651dfc17:0xc0bec0987d439f9d!8m2!3d21.0756659!4d105.7032676!16s%2Fg%2F11mtg0qmt4?entry=ttu&g_ep=EgoyMDI1MDQyOS4wIKXMDSoASAFQAw%3D%3D', '_blank')} style={{ cursor: 'pointer' }} className='underline'>
    BT01 - Lô 07 - Tân Tây Đô - Tân Lập - Đan Phượng - Hà Nội
  </span>
</p>
        </div>
        
        <div className='hidden md:flex flex-col items-start w-full'> 
          <h2 className='font-semibold text-white mb-5'>
          Đăng ký để nhận các thông tin mới nhất của chúng tôi
          </h2>
          <p className='text-sm text-white/80'>Tin tức, bài viết và tài nguyên mới nhất sẽ được gửi đến hộp thư đến của bạn hàng tuần</p>
          <div className='flex items-center gap-2 pt-4'>
            <input type="email" placeholder='Nhập email của bạn' 
            className='border border-gray-500/30 bg-gray-800 text-gray-500 placeholder-gray-500 outline-none w-64 h-9 rounded px-2 text-sm'/>
            <button className='bg-blue-600 w-24 h-9 text-white rounded'>Đăng ký</button>
          </div>
        </div>
      </div>
      <p className='py-4 text-center text-xs md:text-sm text-white/60'>Copyright 2025 © IES. All Right Reserved.</p>
    </footer>
  )
}

export default Footer

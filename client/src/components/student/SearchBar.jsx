import React, { useState } from 'react'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'

const SearchBar = ({data}) => {

  const navigate = useNavigate()
  const [input, setInput] = useState(data ? data : '')

  const onSearchHandler = (e) => {
    e.preventDefault()
    navigate('/course-list/' + input)
  }

  return (
     <form onSubmit={onSearchHandler} className='max-w-xl w-full md:h-14 h-12 flex items-center bg-white border border-gray-500/20 rounded'>
      <img src={assets.search_icon} alt="search_icon" className='md:w-auto w-10 px-3 '/>
      <input onChange={e => setInput(e.target.value)} value={input} 
      type="text" placeholder="Tìm kiếm khóa học" className='rounded-md bg-gray-100 w-full py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600'/> 
      <button type="submit" className='bg-blue-600 rounded text-white md:px-10 px-7 md:py-3py-2 mx-3 '>Tìm kiếm</button> 
     </form>
  
  )
}

export default SearchBar

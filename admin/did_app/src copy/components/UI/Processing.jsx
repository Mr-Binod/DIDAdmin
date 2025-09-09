import Image from 'next/image'
import React from 'react'

const Processing = ({ImageName, failed }) => {

    return (
        <div className='fixed lg:absolute h-screen w-full z-100 top-0 left-0 backdrop-blur-sm'>
            {!failed  ? <div className='w-[90%] max-w-md lg:w-100 lg:h-60 z-1000  rounded-2xl absolute top-1/2 lg:top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                <Image src={ImageName} alt="verified" width={350} height={300} className='mx-auto' />
                {/* <div className='text-black text-2xl font-noto-serif font-semibold w-fit mx-auto '>검증 완료</div> */}
            </div> :
            <div className='w-[90%] max-w-md lg:w-100 lg:h-60 z-1000 border-1 shadow-xl rounded-2xl absolute top-1/2 lg:top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                <Image src={ImageName} alt="verified" width={150} height={150} className='mx-auto my-6' />
                <div className='text-black text-2xl font-noto-serif font-semibold w-fit mx-auto '>에러 발생</div>
            </div>}
        </div>
    )
}

export default Processing

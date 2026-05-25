import { useEffect, useState } from 'react'

const getViewport = () => {
  if (typeof window === 'undefined') {
    return { width: 1280, height: 720 }
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight
  }
}

export const useResponsive = () => {
  const [viewport, setViewport] = useState(getViewport)

  useEffect(() => {
    const handleResize = () => setViewport(getViewport())

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    ...viewport,
    isMobile: viewport.width < 768,
    isTablet: viewport.width < 1024,
    isDesktop: viewport.width >= 1024
  }
}

export default useResponsive

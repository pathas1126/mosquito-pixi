import { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const isMobileScreen = useMediaQuery({ query: '(max-width: 500px)' });

  useEffect(() => {
    if (isMobileScreen) setIsMobile(isMobileScreen);
  }, [isMobileScreen]);

  return isMobile;
};

export default useMobile;

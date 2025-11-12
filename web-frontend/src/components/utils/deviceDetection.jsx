export const getDeviceOS = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  // iOS detection
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return 'iOS';
  }

  // Android detection
  if (/android/i.test(userAgent)) {
    return 'Android';
  }

  // Default to desktop/other
  return 'Desktop';
};

export const isMobileDevice = () => {
  const os = getDeviceOS();
  return os === 'iOS' || os === 'Android';
};

export const getBookingLink = () => {
  const os = getDeviceOS();
  
  if (os === 'iOS') {
    return 'https://apps.apple.com/gb/app/expertrait/id6752484611';
  } else if (os === 'Android') {
    return 'https://play.google.com/store/apps/details?id=com.v1.expertrait&pcampaignid=web_share';
  } else {
    // Desktop users go to download app page
    return '/DownloadApp';
  }
};

export const handleBookNowClick = () => {
  const bookingLink = getBookingLink();
  
  if (bookingLink.startsWith('http')) {
    // External link (App Store links) - open in same window
    window.location.href = bookingLink;
  } else {
    // Internal link (DownloadApp page for desktop)
    window.location.href = bookingLink;
  }
};
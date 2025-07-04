
// T-shirt mockups
import mockup1 from './images/tshirt/mockup-1.webp';
import mockup2 from './images/tshirt/mockup-2.webp';
import mockup3 from './images/tshirt/mockup-3.webp';
import mockup4 from './images/tshirt/mockup-4.webp';
import mockup5 from './images/tshirt/mockup-5.webp';
import mockup6 from './images/tshirt/mockup-6.webp';

// Actual t-shirt color images
import tshirtBlack from './images/tshirt/black tshirt.png';
import tshirtWhite from './images/tshirt/white tshirt.png';
import tshirtRed from './images/tshirt/red tshirt.jpg';
import tshirtGrey from './images/tshirt/grey tshirt.png';
import tshirtBlue from './images/tshirt/blue tshirt.png';

// Design images
import designFlow from './images/design/designFlow.webp';
import placeholder from './images/design/placeholder.svg';

// Logos
// import mainLogo from './logos/main-logo.svg';
// import footerLogo from './logos/footer-logo.svg';

// Export all assets for easy access
export const tshirtImages = {
  mockup1,
  mockup2,
  mockup3,
  mockup4,
  mockup5,
  mockup6
};

export const tshirtColors = {
  black: tshirtBlack,
  white: tshirtWhite,
  red: tshirtRed,
  grey: tshirtGrey,
  blue: tshirtBlue
};

export const designImages = {
  designFlow,
  placeholder
};

// export const logos = {
//   mainLogo,
//   footerLogo
// };

// Quick reference guide for asset paths
export const assetPaths = {
  images: {
    tshirt: 'assets/images/tshirt/',
    design: 'assets/images/design/'
  },
  logos: 'assets/logos/',
  videos: 'assets/videos/',
  gifs: 'assets/gifs/'
};

// Official manufacturer logos; source URLs recorded in catalogue-imports/brand-logos.json.
const logos = {
  "torlys flooring": {
    "src": "/assets/brands/torlys-flooring.svg",
    "dark": false
  },
  "patcraft": {
    "src": "/assets/brands/patcraft.svg",
    "dark": false
  },
  "pentz commercial": {
    "src": "/assets/brands/pentz-commercial.svg",
    "dark": false
  },
  "anderson tuftex": {
    "src": "/assets/brands/anderson-tuftex.webp",
    "dark": false
  },
  "shaw floors": {
    "src": "/assets/brands/shaw-floors.webp",
    "dark": false
  },
  "richmond flooring (shnier/gesco)": {
    "src": "/assets/brands/richmond-flooring-shnier-gesco-.svg",
    "dark": false
  },
  "msi surfaces": {
    "src": "/assets/brands/msi-surfaces.svg",
    "dark": false
  },
  "philadelphia commercial": {
    "src": "/assets/brands/philadelphia-commercial.svg",
    "dark": false
  },
  "shaw contract": {
    "src": "/assets/brands/shaw-contract.svg",
    "dark": false
  },
  "beaulieu canada": {
    "src": "/assets/brands/beaulieu-canada.png",
    "dark": true
  },
  "aladdin commercial": {
    "src": "/assets/brands/aladdin-commercial.svg",
    "dark": false
  },
  "biyork floors": {
    "src": "/assets/brands/biyork-floors.jpg",
    "dark": false
  },
  "forbo": {
    "src": "/assets/brands/forbo.svg",
    "dark": false
  },
  "lee flooring": {
    "src": "/assets/brands/lee-flooring.webp",
    "dark": false
  },
  "vifloor": {
    "src": "/assets/brands/vifloor.png",
    "dark": true
  },
  "mohawk industries": {
    "src": "/assets/brands/mohawk-industries.png",
    "dark": false
  },
  "interface": {
    "src": "/assets/brands/interface.svg",
    "dark": false
  },
  "godfrey hirst": {
    "src": "/assets/brands/godfrey-hirst.svg",
    "dark": false
  },
  "goodfellow": {
    "src": "/assets/brands/goodfellow.png",
    "dark": false
  },
  "stanton carpet": {
    "src": "/assets/brands/stanton-carpet.jpg",
    "dark": false
  }
};
export const brandLogo = name => logos[String(name).trim().toLowerCase()] || null;

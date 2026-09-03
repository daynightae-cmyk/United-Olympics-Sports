import { Sports3DRegistry } from "./sports3d.types";

// Central registry for sport 3D identity assets.
// If an asset is not available locally, set licenseStatus to 'review-required' and leave assetPath null.
export const sports3dRegistry: Sports3DRegistry = {
  football: {
    key: "football",
    assetPath: "/media/sports-3d/football.png",
    licenseSource: "figma:Sports-3D-Icon-Pack-Community",
    licenseStatus: "review-required",
  },
  basketball: {
    key: "basketball",
    assetPath: "/media/sports-3d/basketball.png",
    licenseSource: "figma:Sports-3D-Icon-Pack-Community",
    licenseStatus: "review-required",
  },
  swimming: {
    key: "swimming",
    assetPath: "/media/sports-3d/swimming.png",
    licenseSource: "figma:Sports-3D-Icon-Pack-Community",
    licenseStatus: "review-required",
  },
  tennis: {
    key: "tennis",
    assetPath: "/media/sports-3d/tennis.png",
    licenseSource: "figma:Sports-3D-Icon-Pack-Community",
    licenseStatus: "review-required",
  },
};

export default sports3dRegistry;

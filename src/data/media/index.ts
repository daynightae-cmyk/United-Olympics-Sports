import type { SportMediaAsset, SportMediaUsage } from '../../domain/contracts';
import { basketballMediaAssets } from './basketball';
import { footballMediaAssets } from './football';
import { swimmingMediaAssets } from './swimming';

export const sportMediaAssets: SportMediaAsset[] = [
  ...footballMediaAssets,
  ...swimmingMediaAssets,
  ...basketballMediaAssets,
];

export function getSportMediaAssets(sportId: string) {
  return sportMediaAssets
    .filter(asset => asset.sportId === sportId)
    .sort((a, b) => a.order - b.order);
}

export function getSportMediaByUsage(sportId: string, usage: SportMediaUsage) {
  return getSportMediaAssets(sportId).find(asset => asset.usage === usage);
}

export function getSportPreviewMedia(sportId: string) {
  const assets = getSportMediaAssets(sportId);
  return assets.find(asset => asset.usage === 'brand')
    ?? assets.find(asset => asset.usage === 'hero')
    ?? assets[0];
}

export { basketballMediaAssets, footballMediaAssets, swimmingMediaAssets };

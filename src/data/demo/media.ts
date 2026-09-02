import type { SportMediaAsset } from '../../domain/contracts';
import { sportMediaAssets } from '../media';

export const demoSportMediaAssets: SportMediaAsset[] = [...sportMediaAssets];
export { footballMediaAssets, sportMediaAssets, swimmingMediaAssets } from '../media';

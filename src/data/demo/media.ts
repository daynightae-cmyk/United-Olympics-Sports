import type { SportMediaAsset } from '../../domain/contracts';
import { swimmingMediaAssets } from '../media/swimming';

export const demoSportMediaAssets: SportMediaAsset[] = [...swimmingMediaAssets];
export { swimmingMediaAssets };

import { MOVING_AVERAGE_PERCENT_DIRECTION_CHANGE } from '../../config/constants';
import { Direction } from '../direction';

export function movingAverageDirection(value: number, previousValue: number): Direction {
  const res = value / previousValue * 100 - 100;
  if (res > MOVING_AVERAGE_PERCENT_DIRECTION_CHANGE) return 'up';
  if (res < -1 * MOVING_AVERAGE_PERCENT_DIRECTION_CHANGE) return 'down';
  return 'flat';
}
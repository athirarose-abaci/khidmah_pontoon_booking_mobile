import dayjs from 'dayjs';
import { Colors } from '../constants/customStyles';

export const getMarkedDates = (startDate, endDate) => {
  if (!startDate) return {};

  let marked = {
    [startDate]: {
      startingDay: true,
      color: Colors.primary,
      textColor: 'white',
    },
  };

  if (!endDate) return marked;

  let current = dayjs(startDate);
  let last = dayjs(endDate);

  while (current.isBefore(last, 'day')) {
    current = current.add(1, 'day');
    if (current.isBefore(last, 'day')) {
      marked[current.format('YYYY-MM-DD')] = {
        color: Colors.primary,
        textColor: 'white',
      };
    }
  }

  marked[endDate] = {
    endingDay: true,
    color: Colors.primary,
    textColor: 'white',
  };

  return marked;
};

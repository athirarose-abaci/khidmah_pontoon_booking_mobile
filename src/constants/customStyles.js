export const Colors = {
  black: '#000000',
  white: '#ffffff',

  primary: '#75C8AD',
  font_gray: '#959595',
  border_line: '#F2F2F2',
  bg_color: '#F7F7F7',
  tab_inactive: '#C8C8C8',
};

export function getStatusTagColors(status) {
  const key = (status || '').toString().trim().toLowerCase();

  switch (key) {
    case 'confirmed':
      return {
        backgroundColor: 'rgba(67, 98, 88, 0.75)',
        textColor: '#47BCAA',
      };
    case 'checked in':
      return {
        backgroundColor: 'rgba(25, 60, 70, 0.75)',
        textColor: '#5CC7E6',
      };
    case 'checked out':
      return {
        backgroundColor: 'rgba(78, 52, 29, 0.75)',
        textColor: '#F27C21',
      };
    default:
      return {
        backgroundColor: '#E7E7E7',
        textColor: Colors.black,
      };
  }
}

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/pt-br'
import duration from 'dayjs/plugin/duration';

dayjs.locale('pt-br')
dayjs.extend(utc);
dayjs.extend(duration);

export { dayjs }
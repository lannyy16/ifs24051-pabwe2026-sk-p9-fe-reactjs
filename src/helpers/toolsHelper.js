import Swal from 'sweetalert2'
export function notify(message,icon='success'){return Swal.fire({text:message,icon,confirmButtonText:'Mengerti'})}
export function formatDate(value){if(!value)return '-';const d=new Date(value);if(Number.isNaN(d.getTime()))return '-';return new Intl.DateTimeFormat('id-ID',{dateStyle:'medium'}).format(d)}
export function readingLabel(value){return `${Number(value)||1} menit membaca`}
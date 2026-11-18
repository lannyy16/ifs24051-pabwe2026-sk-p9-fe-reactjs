import Swal from 'sweetalert2'

export const showSuccess = (message) =>
  Swal.fire({ icon: 'success', title: 'Berhasil', text: message, timer: 1800, showConfirmButton: false })

export const showError = (message) =>
  Swal.fire({ icon: 'error', title: 'Oops...', text: message })

export const confirmDelete = async (title) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Hapus artikel?',
    text: title,
    showCancelButton: true,
    confirmButtonText: 'Ya, hapus',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#e11d48',
  })
  return result.isConfirmed
}

export const formatDate = (iso) => {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

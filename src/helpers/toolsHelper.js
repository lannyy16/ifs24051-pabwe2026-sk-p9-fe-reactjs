// SweetAlert2 dimuat saat dibutuhkan agar tidak membebani bundle awal (halaman publik).
const loadSwal = async () => (await import('sweetalert2')).default

export const showSuccess = async (message) =>
  (await loadSwal()).fire({ icon: 'success', title: 'Berhasil', text: message, timer: 1800, showConfirmButton: false })

export const showError = async (message) =>
  (await loadSwal()).fire({ icon: 'error', title: 'Oops...', text: message })

export const confirmDelete = async (title) => {
  const Swal = await loadSwal()
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

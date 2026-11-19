// SweetAlert2 dimuat malas (lazy) agar tidak membebani bundel awal.
const loadSwal = async () => (await import('sweetalert2')).default

export const showSuccess = async (message) => {
  const Swal = await loadSwal()
  return Swal.fire({ icon: 'success', title: 'Berhasil', text: message, timer: 1800, showConfirmButton: false })
}

export const showError = async (message) => {
  const Swal = await loadSwal()
  return Swal.fire({ icon: 'error', title: 'Oops...', text: message })
}

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

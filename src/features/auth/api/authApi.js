import{apiRequest,setToken}from'../../../helpers/apiHelper'
export async function login(payload){const data=await apiRequest('/auth/login',{method:'POST',body:JSON.stringify(payload)});setToken(data.token);return data}
export const register=payload=>apiRequest('/auth/register',{method:'POST',body:JSON.stringify(payload)})
export const profile=()=>apiRequest('/auth/profile')
export const updateProfile=payload=>apiRequest('/auth/profile',{method:'PUT',body:JSON.stringify(payload)})
export async function logout(){try{await apiRequest('/auth/logout',{method:'POST'})}finally{setToken('')}}
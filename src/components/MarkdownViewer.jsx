import{useEffect,useRef}from'react'
import Viewer from'@toast-ui/editor/dist/toastui-editor-viewer'
import'@toast-ui/editor/dist/toastui-editor.css'
export default function MarkdownViewer({content=''}){const el=useRef(null),viewer=useRef(null);useEffect(()=>{if(!el.current)return;viewer.current=new Viewer({el:el.current,initialValue:content,usageStatistics:false});return()=>viewer.current?.destroy()},[]);return <div ref={el} className="markdown-viewer"/>}
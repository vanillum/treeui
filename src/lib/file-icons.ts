import { 
  FileJson,
  FileText,
  FileTs,
  FileJs,
  FileCode2,
  FileImage,
  FileVideo,
  FileAudio,
  FileCss,
  FileHtml,
  FileType,
  File
} from 'lucide-react';

export const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'ts':
    case 'tsx':
      return FileTs;
    case 'js':
    case 'jsx':
      return FileJs;
    case 'json':
      return FileJson;
    case 'md':
    case 'txt':
      return FileText;
    case 'css':
    case 'scss':
    case 'sass':
      return FileCss;
    case 'html':
    case 'htm':
      return FileHtml;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return FileImage;
    case 'mp4':
    case 'mov':
    case 'avi':
      return FileVideo;
    case 'mp3':
    case 'wav':
    case 'ogg':
      return FileAudio;
    case 'font':
    case 'ttf':
    case 'otf':
    case 'woff':
    case 'woff2':
      return FileType;
    default:
      return File;
  }
}; 
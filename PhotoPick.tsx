import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  Camera, 
  Upload, 
  Check, 
  Heart, 
  Share2, 
  Trash2, 
  Image as ImageIcon, 
  Download, 
  Copy,
  Users,
  Grid,
  List,
  X
} from 'lucide-react';

// --- Firebase Configuration & Initialization ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Main Application Component ---
export default function PhotoPickApp() {
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [userRole, setUserRole] = useState('viewer'); // 'uploader' (Student) or 'viewer' (Teacher)
  const [uploading, setUploading] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  
  // Authentication
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // Data Sync
  useEffect(() => {
    if (!user) return;
    
    // Using simple collection reference without complex query first to avoid index issues
    // We will sort in memory
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'photos');
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const photoData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort in memory by timestamp desc
      photoData.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA; // Newest first
      });

      setPhotos(photoData);
      setSelectedCount(photoData.filter(p => p.selected).length);
    }, (error) => {
      console.error("Error fetching photos:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Image Compression & Upload Logic
  const processAndUploadFiles = async (files) => {
    if (!user) return;
    setUploading(true);

    try {
      const batchPromises = Array.from(files).map(async (file) => {
        if (!file.type.startsWith('image/')) return;

        // Compress image to Base64 to fit in Firestore (limit < 1MB)
        const compressedBase64 = await compressImage(file);
        
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'photos'), {
          filename: file.name,
          url: compressedBase64,
          selected: false,
          createdAt: serverTimestamp(),
          uploadedBy: user.uid
        });
      });

      await Promise.all(batchPromises);
    } catch (error) {
      console.error("Upload error:", error);
      alert("上傳發生錯誤，可能是檔案太大。");
    } finally {
      setUploading(false);
    }
  };

  // Helper: Compress Image
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Resize logic: Max 800px width/height for preview purposes
          const MAX_SIZE = 800; 
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Export as JPEG with 0.6 quality
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
      };
    });
  };

  // Interactions
  const toggleSelection = async (photoId, currentStatus) => {
    if (!user) return;
    const photoRef = doc(db, 'artifacts', appId, 'public', 'data', 'photos', photoId);
    await updateDoc(photoRef, {
      selected: !currentStatus
    });
  };

  const deletePhoto = async (photoId) => {
    if (!confirm('確定要刪除這張照片嗎？')) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'photos', photoId));
  };

  const copySelectedList = () => {
    const selectedNames = photos
      .filter(p => p.selected)
      .map(p => p.filename)
      .join('\n');
    
    if (!selectedNames) {
      alert('還沒有選取任何照片喔！');
      return;
    }

    // Using document.execCommand for iframe compatibility
    const textArea = document.createElement("textarea");
    textArea.value = selectedNames;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      alert(`已複製 ${selectedCount} 個檔名到剪貼簿！`);
    } catch (err) {
      console.error('Copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const clearAllPhotos = async () => {
    if (!confirm('警告：這將刪除所有照片。確定要清空嗎？')) return;
    // Note: In a real app, do this server side or in batches. 
    // Here we just delete one by one for the demo limits.
    const promises = photos.map(p => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'photos', p.id)));
    await Promise.all(promises);
  };

  // UI Components
  if (!user) return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">載入中...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Camera size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">PhotoPick</h1>
              <p className="text-xs text-gray-400">雲端挑片工具</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="hidden md:flex bg-gray-800 rounded-lg p-1">
              <button 
                onClick={() => setUserRole('uploader')}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${userRole === 'uploader' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
              >
                我是攝影師 (上傳)
              </button>
              <button 
                onClick={() => setUserRole('viewer')}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${userRole === 'viewer' ? 'bg-pink-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
              >
                我是老師 (挑片)
              </button>
            </div>
            
            <button 
              onClick={() => setShowSummary(true)}
              className="relative p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
            >
              <Heart className={`w-5 h-5 ${selectedCount > 0 ? 'text-pink-500 fill-pink-500' : 'text-gray-400'}`} />
              {selectedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {selectedCount}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Role Switcher */}
        <div className="md:hidden flex border-t border-gray-800">
           <button 
              onClick={() => setUserRole('uploader')}
              className={`flex-1 py-2 text-xs font-medium text-center ${userRole === 'uploader' ? 'bg-gray-800 text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-500'}`}
            >
              攝影師模式
            </button>
            <button 
              onClick={() => setUserRole('viewer')}
              className={`flex-1 py-2 text-xs font-medium text-center ${userRole === 'viewer' ? 'bg-gray-800 text-pink-400 border-b-2 border-pink-500' : 'text-gray-500'}`}
            >
              挑片模式
            </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {userRole === 'uploader' ? '上傳照片區' : '挑選照片'}
            </h2>
            <p className="text-gray-400 text-sm">
              {userRole === 'uploader' 
                ? '請將照片拖曳至此。系統會自動壓縮為預覽圖。' 
                : '請點擊愛心選取你喜歡的照片。'}
            </p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {userRole === 'uploader' && (
              <label className="flex-1 md:flex-none cursor-pointer flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
                <Upload size={18} />
                <span>{uploading ? '處理中...' : '新增照片'}</span>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => processAndUploadFiles(e.target.files)}
                  disabled={uploading}
                />
              </label>
            )}
            
            {userRole === 'viewer' && (
              <button 
                onClick={copySelectedList}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Copy size={18} />
                <span>複製清單 ({selectedCount})</span>
              </button>
            )}

            <div className="flex bg-gray-800 rounded-lg p-1 ml-auto md:ml-0">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
              >
                <Grid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Upload Area (Drag & Drop) */}
        {userRole === 'uploader' && (
          <div 
            className={`mb-8 border-2 border-dashed rounded-xl p-8 text-center transition-colors ${uploading ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700 hover:border-indigo-500 hover:bg-gray-800/50'}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              processAndUploadFiles(e.dataTransfer.files);
            }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                <Upload className="text-gray-400" />
              </div>
              <div>
                <p className="text-gray-300 font-medium">拖曳照片至此上傳</p>
                <p className="text-xs text-gray-500 mt-1">支援 JPG, PNG (自動壓縮)</p>
              </div>
            </div>
          </div>
        )}

        {/* Gallery */}
        {photos.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
            <p>目前還沒有照片</p>
            {userRole === 'viewer' && <p className="text-sm mt-2">請等待攝影師上傳</p>}
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {photos.map((photo) => (
                  <div 
                    key={photo.id} 
                    className={`group relative aspect-square bg-gray-900 rounded-lg overflow-hidden border-2 transition-all ${photo.selected ? 'border-pink-500 ring-2 ring-pink-500/20' : 'border-transparent hover:border-gray-600'}`}
                    onClick={() => userRole === 'viewer' && toggleSelection(photo.id, photo.selected)}
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.filename} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Selection Indicator (Always visible if selected) */}
                    <div className={`absolute top-2 right-2 transition-transform ${photo.selected ? 'scale-100' : 'scale-0 group-hover:scale-100'}`}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(photo.id, photo.selected);
                        }}
                        className={`p-2 rounded-full shadow-lg ${photo.selected ? 'bg-pink-500 text-white' : 'bg-gray-800/80 text-gray-400 hover:text-white'}`}
                      >
                        <Heart size={18} className={photo.selected ? 'fill-current' : ''} />
                      </button>
                    </div>

                    {/* Delete Button (Uploader Only) */}
                    {userRole === 'uploader' && (
                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePhoto(photo.id);
                          }}
                          className="p-1.5 bg-red-500/80 text-white rounded-md hover:bg-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}

                    {/* Filename */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="text-xs text-white truncate font-mono">{photo.filename}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {photos.map((photo) => (
                  <div 
                    key={photo.id}
                    className={`flex items-center gap-4 p-3 rounded-lg bg-gray-800/50 border ${photo.selected ? 'border-pink-500/50 bg-pink-500/10' : 'border-transparent'}`}
                  >
                    <img src={photo.url} className="w-16 h-16 object-cover rounded bg-gray-900" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm text-gray-200 truncate">{photo.filename}</p>
                      <p className="text-xs text-gray-500">
                        {photo.createdAt?.seconds ? new Date(photo.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                         onClick={() => toggleSelection(photo.id, photo.selected)}
                         className={`p-2 rounded-lg border ${photo.selected ? 'bg-pink-500 border-pink-500 text-white' : 'border-gray-600 text-gray-400 hover:border-gray-400'}`}
                      >
                        {photo.selected ? <Check size={18} /> : userRole === 'viewer' ? '選取' : (photo.selected ? '已選' : '未選')}
                      </button>
                      {userRole === 'uploader' && (
                        <button onClick={() => deletePhoto(photo.id)} className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Clear All (Uploader Only) */}
        {userRole === 'uploader' && photos.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-800 flex justify-center">
            <button 
              onClick={clearAllPhotos}
              className="text-red-500 text-sm hover:underline hover:text-red-400"
            >
              清空所有照片（慎用）
            </button>
          </div>
        )}
      </main>

      {/* Selection Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 w-full max-w-md rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-white">已選清單 ({selectedCount})</h3>
              <button onClick={() => setShowSummary(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {selectedCount === 0 ? (
                <div className="text-center text-gray-500 py-8">還沒選任何照片</div>
              ) : (
                <ul className="space-y-1">
                  {photos.filter(p => p.selected).map(p => (
                    <li key={p.id} className="flex items-center gap-2 text-sm text-gray-300 font-mono py-1 border-b border-gray-800/50 last:border-0">
                      <Check size={14} className="text-pink-500" />
                      {p.filename}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-4 bg-gray-800/50 border-t border-gray-800">
               <button 
                onClick={copySelectedList}
                className="w-full flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-3 rounded-xl transition-colors font-medium"
              >
                <Copy size={18} />
                <span>複製所有檔名</span>
              </button>
              <p className="text-xs text-center text-gray-500 mt-2">複製後可直接傳給攝影師</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

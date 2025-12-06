import React, { useState, useEffect } from 'react';
import { Folder, Image, Home, ChevronRight, Plus, Upload, ArrowLeft } from 'lucide-react';
import './App.css';

export default function App() {
  const [currentPath, setCurrentPath] = useState('/');
  const [photos, setPhotos] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    loadPhotos();
  }, [currentPath]);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/photos?directory=${encodeURIComponent(currentPath)}`);
      const data = await response.json();
      setPhotos(data.photos || []);
      setFolders(data.folders || []);
    } catch (error) {
      console.error('Error loading photos:', error);
    }
    setLoading(false);
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      await fetch('http://localhost:8000/createFolder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directory: currentPath,
          folderName: newFolderName
        })
      });
      setNewFolderName('');
      setShowNewFolderInput(false);
      loadPhotos();
    } catch (error) {
      console.error('Error creating folder:', error);
      setFolders([...folders, newFolderName]);
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    formData.append('directory', currentPath);
    selectedFiles.forEach(file => {
      formData.append('photos', file);
    });

    try {
      await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData
      });
      setSelectedFiles([]);
      loadPhotos();
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Upload feature requires backend connection');
    }
  };

  const navigateToFolder = (folderName) => {
    const newPath = currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`;
    setCurrentPath(newPath);
  };

  const navigateUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    setCurrentPath(parts.length === 0 ? '/' : '/' + parts.join('/'));
  };

  const getPathParts = () => {
    if (currentPath === '/') return [{ name: 'Home', path: '/' }];
    const parts = currentPath.split('/').filter(Boolean);
    return [
      { name: 'Home', path: '/' },
      ...parts.map((part, idx) => ({
        name: part,
        path: '/' + parts.slice(0, idx + 1).join('/')
      }))
    ];
  };

  return (
    <div className="app-container">
      <div className="app-content">
        {/* Header */}
        <div className="header-card">
          <div className="header-top">
            <div className="header-title-section">
              <div className="icon-badge">
                <Image size={24} color="white" />
              </div>
              <h1 className="app-title">Photo Gallery</h1>
            </div>
            
            <div className="header-actions">
              <label className="btn btn-primary">
                <Upload size={16} />
                Upload Photos
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </label>
              
              <button
                onClick={() => setShowNewFolderInput(!showNewFolderInput)}
                className="btn btn-success"
              >
                <Plus size={16} />
                New Folder
              </button>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="breadcrumb">
            {currentPath !== '/' && (
              <button onClick={navigateUp} className="breadcrumb-back">
                <ArrowLeft size={16} />
              </button>
            )}
            {getPathParts().map((part, idx) => (
              <React.Fragment key={part.path}>
                {idx > 0 && <ChevronRight size={16} className="breadcrumb-separator" />}
                <button
                  onClick={() => setCurrentPath(part.path)}
                  className={`breadcrumb-item ${idx === getPathParts().length - 1 ? 'active' : ''}`}
                >
                  {idx === 0 && <Home size={16} />}
                  {part.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="card">
            <div className="selected-files">
              <p className="selected-files-text">
                {selectedFiles.length} file(s) selected
              </p>
              <div className="selected-files-actions">
                <button
                  onClick={() => setSelectedFiles([])}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={uploadImages}
                  className="btn btn-primary"
                >
                  Upload Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* New Folder Input */}
        {showNewFolderInput && (
          <div className="card">
            <div className="new-folder-input">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createFolder()}
                placeholder="Folder name..."
                className="folder-input"
                autoFocus
              />
              <button onClick={createFolder} className="btn btn-success">
                Create
              </button>
              <button
                onClick={() => {
                  setShowNewFolderInput(false);
                  setNewFolderName('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="card">
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <>
              {/* Folders */}
              {folders.length > 0 && (
                <div className="section">
                  <h2 className="section-title">Folders</h2>
                  <div className="folders-grid">
                    {folders.map((folder, idx) => (
                      <button
                        key={idx}
                        onClick={() => navigateToFolder(folder)}
                        className="folder-item"
                      >
                        <div className="folder-icon">
                          <Folder size={32} />
                        </div>
                        <span className="folder-name">{folder}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos */}
              {photos.length > 0 ? (
                <div className="section">
                  <h2 className="section-title">Photos</h2>
                  <div className="photos-grid">
                    {photos.map((photo) => (
                      <div key={photo.id} className="photo-item">
                        <img src={photo.url} alt={photo.name} />
                        <div className="photo-overlay">
                          <p className="photo-name">{photo.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : folders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <Image size={48} />
                  </div>
                  <p className="empty-state-title">No photos or folders yet</p>
                  <p className="empty-state-subtitle">
                    Upload photos or create a folder to get started
                  </p>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
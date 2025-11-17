"use client";
import React from "react";
import { ContextCreator } from "@/component/context/context";
import { motion } from "motion/react";
import { FaDownload, FaEdit, FaSave, FaTimes } from "react-icons/fa";

interface CVData {
  name: string;
  email: string;
  location: string;
  image: string;
  title: string;
  level: string;
  about: string;
  projects: Array<{
    name: string;
    description: string;
    final_mark: number;
    validated: boolean;
  }>;
  skills: string[];
  languages: Array<{
    name: string;
    level: string;
  }>;
}

const CVMakerPage = () => {
  const context = React.useContext(ContextCreator);
  const userData = context?.userData;
  
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cvData, setCvData] = React.useState<any>(null);
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [editedData, setEditedData] = React.useState<CVData | null>(null);

  React.useEffect(() => {
    if (userData) {
      fetchCVData();
    }
  }, [userData]);

  const fetchCVData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/cv-maker", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCvData(data);
        setEditedData(data);
      }
    } catch (error) {
      console.error("Error fetching CV data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setCvData(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedData(cvData);
    setIsEditing(false);
  };

  const downloadCV = () => {
    const displayData = isEditing ? editedData : cvData;
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const imageUrl = displayData?.image || userData?.image?.link || '';

    printWindow.document.write(`
      <html>
        <head>
          <title>CV - ${displayData?.name || ''}</title>
          <style>
            @media print {
              @page { margin: 1cm; }
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              color: #333;
            }
            .header {
              display: flex;
              align-items: center;
              gap: 20px;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 3px solid #0070ef;
            }
            .header img {
              width: 120px;
              height: 120px;
              border-radius: 8px;
              object-fit: cover;
            }
            h1 { 
              color: #0070ef; 
              margin: 0;
              font-size: 32px;
            }
            h2 { 
              color: #0070ef; 
              margin-top: 30px;
              margin-bottom: 15px;
              font-size: 20px;
              border-bottom: 2px solid #0070ef;
              padding-bottom: 5px;
            }
            .subtitle {
              color: #666;
              font-size: 18px;
              margin: 5px 0;
            }
            .contact {
              color: #666;
              font-size: 14px;
              margin-top: 10px;
            }
            .section { 
              margin: 20px 0; 
            }
            .project { 
              margin: 15px 0; 
              padding: 15px; 
              border-left: 4px solid #0070ef;
              background: #f8f9fa;
            }
            .project h3 {
              margin: 0 0 10px 0;
              color: #333;
            }
            .badge {
              display: inline-block;
              padding: 4px 12px;
              margin: 5px 5px 5px 0;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
            }
            .score {
              background: #e3f2fd;
              color: #0070ef;
            }
            .validated {
              background: #e8f5e9;
              color: #2e7d32;
            }
            .skills {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              margin-top: 10px;
            }
            .skill {
              padding: 8px 16px;
              background: #e3f2fd;
              color: #0070ef;
              border-radius: 6px;
              font-size: 14px;
            }
            .education-box {
              padding: 15px;
              background: #f8f9fa;
              border-left: 4px solid #0070ef;
              margin: 10px 0;
            }
            .languages {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-top: 10px;
            }
            .language {
              padding: 10px;
              background: #f8f9fa;
              border-radius: 6px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            ${imageUrl ? `<img src="${imageUrl}" alt="${displayData?.name || ''}" onerror="this.style.display='none'" />` : ''}
            <div>
              <h1>${displayData?.name || ''}</h1>
              <div class="subtitle">${displayData?.title || ''}</div>
              <div class="contact">${displayData?.email || ''} | ${displayData?.location || ''} | Level ${displayData?.level || ''}</div>
            </div>
          </div>

          ${displayData?.about ? `
          <div class="section">
            <h2>About Me</h2>
            <p>${displayData.about}</p>
          </div>
          ` : ''}

          <div class="section">
            <h2>Education</h2>
            <div class="education-box">
              <h3>42 Network - ${userData?.campus_name || ''}</h3>
              <p>Level ${displayData?.level || '0'}</p>
              <p style="color: #666; font-size: 14px;">${userData?.pool_month || ''} ${userData?.pool_year || ''}</p>
            </div>
          </div>

          ${displayData?.projects && displayData.projects.length > 0 ? `
          <div class="section">
            <h2>Top Projects</h2>
            ${
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              displayData.projects.slice(0, 6).map((project: any) => `
              <div class="project">
                <h3>${project.name}</h3>
                <span class="badge score">Score: ${project.final_mark}/100</span>
                ${project.validated ? '<span class="badge validated">Validated</span>' : ''}
              </div>
            `).join('')}
          </div>
          ` : ''}

          ${displayData?.skills && displayData.skills.length > 0 ? `
          <div class="section">
            <h2>Skills</h2>
            <div class="skills">
              ${displayData.skills.slice(0, 12).map((skill: string) => `
                <span class="skill">${skill}</span>
              `).join('')}
            </div>
          </div>
          ` : ''}

          ${displayData?.languages && displayData.languages.length > 0 ? `
          <div class="section">
            <h2>Languages</h2>
            <div class="languages">
              ${
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                displayData.languages.map((lang: any) => `
                <div class="language">
                  <strong>${lang.name}</strong><br/>
                  <span style="color: #666;">${lang.level}</span>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 z-10 items-center justify-center">
        <div className="text-white font-Tektur text-xl">Loading CV...</div>
      </div>
    );
  }

  const displayData = isEditing ? editedData : cvData;

  return (
    <div className="flex flex-1 z-10 items-center overflow-auto justify-start flex-col">
      <div className="w-full max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white font-Tektur">CV Maker</h1>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-3 py-2 bg-[#0070ef]/20 hover:bg-[#0070ef]/30 border border-[#0070ef]/50 text-white font-Tektur text-sm rounded-lg transition-all duration-300"
                >
                  <FaEdit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={downloadCV}
                  className="flex items-center gap-2 px-3 py-2 bg-[#0070ef] hover:bg-[#0060d0] text-white font-Tektur text-sm font-semibold rounded-lg transition-all duration-300"
                >
                  <FaDownload className="w-4 h-4" />
                  Download PDF
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-white font-Tektur text-sm rounded-lg transition-all duration-300"
                >
                  <FaTimes className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-white font-Tektur text-sm rounded-lg transition-all duration-300"
                >
                  <FaSave className="w-4 h-4" />
                  Save
                </button>
              </>
            )}
          </div>
        </div>

        {/* CV Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#001226]/80 backdrop-blur-xl border border-[#0070ef]/30 rounded-lg p-4 md:p-6"
        >
          {/* Profile Section */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 pb-6 border-b border-[#0070ef]/30">
            {(displayData?.image || userData?.image?.link) && (
              <img
                src={displayData?.image || userData?.image?.link}
                alt={displayData?.name}
                className="w-24 h-24 rounded-lg border-2 border-[#0070ef]/50 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
            <div className="flex-1">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editedData?.name || ''}
                    onChange={(e) => setEditedData({ ...editedData!, name: e.target.value })}
                    className="w-full mb-2 px-3 py-2 bg-[#0070ef]/10 border border-[#0070ef]/30 rounded-lg text-white font-Tektur text-xl font-bold focus:outline-none focus:border-[#0070ef]"
                  />
                  <input
                    type="text"
                    value={editedData?.title || ''}
                    onChange={(e) => setEditedData({ ...editedData!, title: e.target.value })}
                    className="w-full mb-2 px-3 py-2 bg-[#0070ef]/10 border border-[#0070ef]/30 rounded-lg text-gray-300 font-Tektur text-sm focus:outline-none focus:border-[#0070ef]"
                  />
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white font-Tektur mb-1">
                    {displayData?.name}
                  </h2>
                  <p className="text-lg text-gray-300 font-Tektur mb-2">{displayData?.title}</p>
                </>
              )}
              <div className="flex flex-wrap gap-3 text-xs text-gray-400 font-Tektur">
                <span>{displayData?.email}</span>
                <span>•</span>
                <span>{displayData?.location}</span>
                <span>•</span>
                <span>Level {displayData?.level}</span>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white font-Tektur mb-3 flex items-center gap-2">
              <span className="text-[#0070ef]">●</span> About Me
            </h3>
            {isEditing ? (
              <textarea
                value={editedData?.about || ''}
                onChange={(e) => setEditedData({ ...editedData!, about: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-[#0070ef]/10 border border-[#0070ef]/30 rounded-lg text-gray-300 font-Tektur text-sm focus:outline-none focus:border-[#0070ef]"
              />
            ) : (
              <p className="text-gray-300 leading-relaxed font-Tektur text-sm">{displayData?.about}</p>
            )}
          </div>

          {/* Education */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white font-Tektur mb-3 flex items-center gap-2">
              <span className="text-[#0070ef]">●</span> Education
            </h3>
            <div className="bg-[#0070ef]/10 backdrop-blur-sm rounded-lg p-3 border border-[#0070ef]/20">
              <h4 className="text-base font-semibold text-white font-Tektur">42 Network - {userData?.campus_name}</h4>
              <p className="text-gray-300 font-Tektur mt-1 text-sm">Level {displayData?.level}</p>
              <p className="text-gray-400 text-xs font-Tektur mt-1">
                {userData?.pool_month} {userData?.pool_year}
              </p>
            </div>
          </div>

          {/* Projects */}
          {displayData?.projects && displayData.projects.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white font-Tektur mb-3 flex items-center gap-2">
                <span className="text-[#0070ef]">●</span> Top Projects
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {displayData.projects.slice(0, 6).map((project: any, index: number) => (
                  <div
                    key={index}
                    className="bg-[#0070ef]/10 backdrop-blur-sm rounded-lg p-3 border border-[#0070ef]/20 hover:border-[#0070ef]/50 transition-all"
                  >
                    <h4 className="text-base font-semibold text-white font-Tektur mb-2">{project.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-[#0070ef]/20 text-[#0070ef] px-2 py-1 rounded-full font-Tektur">
                        {project.final_mark}/100
                      </span>
                      {project.validated && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-Tektur">
                          Validated
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {displayData?.skills && displayData.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white font-Tektur mb-3 flex items-center gap-2">
                <span className="text-[#0070ef]">●</span> Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {displayData.skills.slice(0, 12).map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="bg-[#0070ef]/10 text-white px-3 py-1.5 rounded-lg font-Tektur text-xs border border-[#0070ef]/30"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {displayData?.languages && displayData.languages.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-white font-Tektur mb-3 flex items-center gap-2">
                <span className="text-[#0070ef]">●</span> Languages
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {displayData.languages.map((lang: any, index: number) => (
                  <div key={index} className="bg-[#0070ef]/10 rounded-lg p-2.5 border border-[#0070ef]/20">
                    <p className="text-white font-Tektur font-semibold text-sm">{lang.name}</p>
                    <p className="text-gray-400 text-xs font-Tektur">{lang.level}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CVMakerPage;

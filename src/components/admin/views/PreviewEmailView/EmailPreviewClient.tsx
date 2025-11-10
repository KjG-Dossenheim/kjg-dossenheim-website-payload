'use client'

import React, { useState, useEffect } from 'react'
import { render } from '@react-email/render'
import {
  confirmationEmailTemplate as membershipConfirmation,
  adminNotificationEmailTemplate as membershipAdmin,
} from '@/collections/membershipApplication/email'
import {
  confirmationEmailTemplate as knallbonbonConfirmation,
  adminNotificationEmailTemplate as knallbonbonAdmin,
} from '@/app/(website)/knallbonbon/anmeldung/emailTemplate'
import {
  confirmationEmailTemplate as contactConfirmation,
  adminNotificationEmailTemplate as contactAdmin,
} from '@/app/(website)/kontakt/emailTemplate'

type EmailTemplate = {
  name: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sampleData: any
}

const emailTemplates: EmailTemplate[] = [
  {
    name: 'Membership Application - Confirmation',
    component: membershipConfirmation,
    sampleData: {
      id: 'sample-id',
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max.mustermann@example.com',
      phone: '+49 123 456789',
      address: 'Musterstraße 1, 12345 Musterstadt',
      birthDate: new Date('2000-01-15').toISOString(),
    },
  },
  {
    name: 'Membership Application - Admin Notification',
    component: membershipAdmin,
    sampleData: {
      id: 'sample-id',
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max.mustermann@example.com',
      phone: '+49 123 456789',
      address: 'Musterstraße 1, 12345 Musterstadt',
      birthDate: new Date('2000-01-15').toISOString(),
    },
  },
  {
    name: 'Knallbonbon Registration - Confirmation',
    component: knallbonbonConfirmation,
    sampleData: {
      firstName: 'Anna',
      lastName: 'Schmidt',
      email: 'anna.schmidt@example.com',
      phone: '+49 123 456789',
      address: 'Hauptstraße 10, 12345 Dossenheim',
      child: [
        {
          firstName: 'Laura',
          lastName: 'Schmidt',
          dateOfBirth: new Date('2015-05-20'),
          gender: 'female',
          photoConsent: true,
          pickupInfo: 'parent',
          healthInfo: 'Keine besonderen Informationen',
        },
      ],
    },
  },
  {
    name: 'Knallbonbon Registration - Admin Notification',
    component: knallbonbonAdmin,
    sampleData: {
      firstName: 'Anna',
      lastName: 'Schmidt',
      email: 'anna.schmidt@example.com',
      phone: '+49 123 456789',
      address: 'Hauptstraße 10, 12345 Dossenheim',
      child: [
        {
          firstName: 'Laura',
          lastName: 'Schmidt',
          dateOfBirth: new Date('2015-05-20'),
          gender: 'female',
          photoConsent: true,
          pickupInfo: 'parent',
          healthInfo: 'Keine besonderen Informationen',
        },
      ],
    },
  },
  {
    name: 'Contact Form - Confirmation',
    component: contactConfirmation,
    sampleData: {
      firstName: 'Thomas',
      lastName: 'Weber',
      email: 'thomas.weber@example.com',
      phone: '+49 123 456789',
      message: 'Ich hätte eine Frage zur Mitgliedschaft.',
    },
  },
  {
    name: 'Contact Form - Admin Notification',
    component: contactAdmin,
    sampleData: {
      firstName: 'Thomas',
      lastName: 'Weber',
      email: 'thomas.weber@example.com',
      phone: '+49 123 456789',
      message: 'Ich hätte eine Frage zur Mitgliedschaft.',
    },
  },
]

export function EmailPreviewClient() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(emailTemplates[0])
  const [viewMode, setViewMode] = useState<'preview' | 'html'>('preview')
  const [htmlString, setHtmlString] = useState<string>('')

  useEffect(() => {
    async function renderEmail() {
      const html = await render(
        React.createElement(selectedTemplate.component, selectedTemplate.sampleData),
      )
      setHtmlString(html)
    }
    renderEmail()
  }, [selectedTemplate])

  return (
    <div className="email-preview-view">
      <style>{`
        .email-preview-view {
          display: flex;
          height: calc(100vh - 200px);
          background: #f5f5f5;
          border-radius: 8px;
          overflow: hidden;
        }
        .sidebar {
          width: 300px;
          background: white;
          border-right: 1px solid #e5e5e5;
          overflow-y: auto;
        }
        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid #e5e5e5;
        }
        .sidebar-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0;
        }
        .template-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .template-item {
          padding: 15px 20px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.2s;
          font-size: 14px;
        }
        .template-item:hover {
          background-color: #f9f9f9;
        }
        .template-item.active {
          background-color: #007acc;
          color: white;
        }
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .toolbar {
          display: flex;
          gap: 10px;
          padding: 15px 20px;
          background: white;
          border-bottom: 1px solid #e5e5e5;
          align-items: center;
        }
        .toolbar-title {
          font-size: 14px;
          font-weight: 600;
          flex: 1;
        }
        .toolbar-button {
          padding: 8px 16px;
          border: 1px solid #d0d0d0;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }
        .toolbar-button:hover {
          background: #f5f5f5;
        }
        .toolbar-button.active {
          background: #007acc;
          color: white;
          border-color: #007acc;
        }
        .preview-container {
          flex: 1;
          overflow: auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .preview-frame {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }
        .html-view {
          padding: 20px;
          background: #1e1e1e;
          color: #d4d4d4;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.5;
          overflow: auto;
          height: 100%;
        }
        .html-view pre {
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      `}</style>

      <div className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-title">Email Templates</h2>
        </div>
        <ul className="template-list">
          {emailTemplates.map((template) => (
            <li
              key={template.name}
              className={`template-item ${selectedTemplate.name === template.name ? 'active' : ''}`}
              onClick={() => setSelectedTemplate(template)}
            >
              {template.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="main-content">
        <div className="toolbar">
          <div className="toolbar-title">{selectedTemplate.name}</div>
          <button
            className={`toolbar-button ${viewMode === 'preview' ? 'active' : ''}`}
            onClick={() => setViewMode('preview')}
          >
            Preview
          </button>
          <button
            className={`toolbar-button ${viewMode === 'html' ? 'active' : ''}`}
            onClick={() => setViewMode('html')}
          >
            HTML
          </button>
        </div>

        <div className="preview-container">
          {viewMode === 'preview' ? (
            <div className="preview-frame">
              <iframe
                srcDoc={htmlString}
                style={{
                  width: '100%',
                  height: '800px',
                  border: 'none',
                }}
                title="Email Preview"
              />
            </div>
          ) : (
            <div className="html-view">
              <pre>{htmlString}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

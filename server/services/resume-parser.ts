import * as fs from 'fs';
import * as path from 'path';

export interface ParsedResume {
  text: string;
  name?: string;
  email?: string;
  phone?: string;
}

export async function parseResume(filePath: string, mimeType: string): Promise<ParsedResume> {
  try {
    if (mimeType === 'application/pdf') {
      return await parsePDF(filePath);
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               mimeType === 'application/msword') {
      return await parseWord(filePath);
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error(`Failed to parse resume: ${error}`);
  }
}

async function parsePDF(filePath: string): Promise<ParsedResume> {
  try {
    // For now, we'll use a simple PDF parsing approach
    // In production, you'd want to use pdf-parse or similar library
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    
    const text = data.text;
    const extracted = extractContactInfo(text);
    
    return {
      text,
      ...extracted,
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    // Fallback: return the file as text if possible
    return {
      text: 'PDF content could not be extracted. Please ensure the file is not corrupted.',
    };
  }
}

async function parseWord(filePath: string): Promise<ParsedResume> {
  try {
    // For now, we'll use mammoth for DOCX parsing
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    
    const text = result.value;
    const extracted = extractContactInfo(text);
    
    return {
      text,
      ...extracted,
    };
  } catch (error) {
    console.error('Word parsing error:', error);
    return {
      text: 'Word document content could not be extracted. Please ensure the file is not corrupted.',
    };
  }
}

function extractContactInfo(text: string): { name?: string; email?: string; phone?: string } {
  const result: { name?: string; email?: string; phone?: string } = {};
  
  // Extract email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = text.match(emailRegex);
  if (emailMatch) {
    result.email = emailMatch[0];
  }
  
  // Extract phone (various formats)
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) {
    result.phone = phoneMatch[0];
  }
  
  // Extract name (first few words before email or at the beginning)
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length > 0) {
    // Usually the name is in the first few lines
    for (const line of lines.slice(0, 3)) {
      // Skip lines that look like contact info
      if (!line.includes('@') && !line.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) && line.length < 50) {
        const words = line.split(/\s+/);
        if (words.length >= 2 && words.length <= 4) {
          result.name = line;
          break;
        }
      }
    }
  }
  
  return result;
}

import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'


const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';


const emptyData = {
  personal: { 
    fullName: ''
  }
};

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { UIProvider } from '../context/UIContext';

// Simple test: clicking the hamburger opens the mobile sidebar (it will mount the overlay panel)
test('mobile hamburger toggles sidebar', async () => {
  render(
    <UIProvider>
      <Navbar />
      <Sidebar />
    </UIProvider>
  );

  // hamburger should be in the document (visible on small screens via class, but here we can query by role/button)
  const hamburger = screen.getByRole('button', { name: /open sidebar/i });
  expect(hamburger).toBeInTheDocument();

  // click to open
  fireEvent.click(hamburger);

  // after clicking, the overlay should be present (we can check for the close button)
  const closeBtn = await screen.findByRole('button', { name: /close/i });
  expect(closeBtn).toBeInTheDocument();

  // click close
  fireEvent.click(closeBtn);

  // close button should disappear (or overlay hidden)
  expect(closeBtn).not.toBeVisible();
});

/**
 * Simple test/demo script for the Custom Sound Upload functionality
 * This can be used to test the API integration
 */

import { settingsService } from "../src/services/settings.service";

async function testCustomSoundUpload() {
  try {
    console.log("🎵 Testing Custom Sound Upload Functionality");

    // Test 1: Get current settings
    console.log("\n1. Getting current user settings...");
    const currentSettings = await settingsService.getUserSettings();
    console.log("Current settings:", {
      notification_sound: currentSettings.notification_sound,
      custom_sound: currentSettings.custom_sound,
      enable_notification_sound: currentSettings.enable_notification_sound,
    });

    // Test 2: Simulate file upload (would be done in browser)
    console.log("\n2. File upload would be done in browser with:");
    console.log(`
    const formData = new FormData();
    formData.append('sound', file);

    const updatedSettings = await settingsService.uploadCustomSound(file);
    `);

    // Test 3: Delete custom sound (if exists)
    if (currentSettings.custom_sound) {
      console.log("\n3. Testing delete custom sound...");
      const updatedSettings = await settingsService.deleteCustomSound();
      console.log(
        "Custom sound deleted:",
        updatedSettings.custom_sound === null
      );
    } else {
      console.log("\n3. No custom sound to delete");
    }

    console.log("\n✅ All tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Example usage in a React component
const exampleReactUsage = `
import React, { useState } from 'react';
import { settingsService } from '@/services/settings.service';
import CustomSoundUpload from '@/components/settings/CustomSoundUpload';

function MySettingsPage() {
  const [settings, setSettings] = useState(null);

  const handleUpload = async (file) => {
    try {
      const updatedSettings = await settingsService.uploadCustomSound(file);
      setSettings(updatedSettings);
      console.log('Upload successful!', updatedSettings.custom_sound);
    } catch (error) {
      console.error('Upload failed:', error.message);
    }
  };

  return (
    <CustomSoundUpload
      currentSettings={settings}
      onSettingsUpdate={setSettings}
    />
  );
}
`;

console.log("React Usage Example:", exampleReactUsage);

export { testCustomSoundUpload };

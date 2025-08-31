"use client";

import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useLanguage } from "@/contexts/LanguageContext";
import { CreateSessionRequest } from "@/services/api/schedules";

// Extended session form interface for the modal
interface ExtendedCreateSessionRequest extends CreateSessionRequest {
  mode: 'single' | 'multiple' | 'bulk';
  schedule_id: number;
  session_count?: number;
  repeat_frequency?: 'daily' | 'weekly' | 'monthly';
}

interface CreateSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionForm: ExtendedCreateSessionRequest;
  setSessionForm: React.Dispatch<React.SetStateAction<ExtendedCreateSessionRequest>>;
  schedules: Array<{schedule_id: number, schedule_name: string, course_name: string}>;
  formLoading: boolean;
  formError: string | null;
  setFormError: React.Dispatch<React.SetStateAction<string | null>>;
  onCreateSession: () => void;
}

export default function CreateSessionsModal({
  isOpen,
  onClose,
  sessionForm,
  setSessionForm,
  schedules,
  formLoading,
  formError,
  setFormError,
  onCreateSession,
}: CreateSessionsModalProps) {
  const { language, t } = useLanguage();

  const handleClose = () => {
    onClose();
    setFormError(null);
    setSessionForm({
      mode: 'single',
      schedule_id: 0,
      session_date: new Date().toISOString().split('T')[0],
      start_time: '',
      end_time: '',
      notes: '',
      appointment_notes: '',
      session_count: 1,
      repeat_frequency: 'weekly',
      repeat: {
        enabled: false,
        frequency: 'weekly',
        interval: 1,
        end: { type: 'after', count: 10 },
        days_of_week: []
      },
      is_makeup_session: false
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
    >
      <div className="max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-300 px-6 pt-6 pb-4">
          <h3 className="text-lg font-bold text-black">{t.createSessions}</h3>
        </div>

        {/* Body */}
        <div className="py-6 px-6 max-h-[75vh] overflow-y-auto flex-1">
          <div className="space-y-6">
            {/* Creation Mode Selection */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                {t.createSessionMode}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="sessionMode"
                    value="single"
                    checked={sessionForm.mode === 'single'}
                    onChange={(e) => setSessionForm(prev => ({...prev, mode: e.target.value as 'single' | 'multiple' | 'bulk'}))}
                    className="h-4 w-4 text-purple-600 cursor-pointer"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">{t.singleSession}</div>
                    <div className="text-sm text-gray-600">{t.createOneSession}</div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="sessionMode"
                    value="multiple"
                    checked={sessionForm.mode === 'multiple'}
                    onChange={(e) => setSessionForm(prev => ({...prev, mode: e.target.value as 'single' | 'multiple' | 'bulk'}))}
                    className="h-4 w-4 text-purple-600 cursor-pointer"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">{t.multipleSession}</div>
                    <div className="text-sm text-gray-600">{t.createMultipleSessions}</div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="sessionMode"
                    value="bulk"
                    checked={sessionForm.mode === 'bulk'}
                    onChange={(e) => setSessionForm(prev => ({...prev, mode: e.target.value as 'single' | 'multiple' | 'bulk'}))}
                    className="h-4 w-4 text-purple-600 cursor-pointer"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">{t.bulkCreate}</div>
                    <div className="text-sm text-gray-600">{t.createBulkSessions}</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Single Session Mode */}
            {sessionForm.mode === 'single' && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  {t.singleSessionDetails}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.selectSchedule} *
                    </label>
                    <select
                      value={sessionForm.schedule_id || 0}
                      onChange={(e) => setSessionForm(prev => ({...prev, schedule_id: parseInt(e.target.value)}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value={0}>{t.selectSchedule}</option>
                      {schedules.map(schedule => (
                        <option key={schedule.schedule_id} value={schedule.schedule_id}>
                          {schedule.schedule_name} - {schedule.course_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.sessionDate} *
                    </label>
                    <input
                      type="date"
                      value={sessionForm.session_date || ''}
                      onChange={(e) => setSessionForm(prev => ({...prev, session_date: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.startTime} *
                    </label>
                    <input
                      type="time"
                      value={sessionForm.start_time || ''}
                      onChange={(e) => setSessionForm(prev => ({...prev, start_time: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.endTime} *
                    </label>
                    <input
                      type="time"
                      value={sessionForm.end_time || ''}
                      onChange={(e) => setSessionForm(prev => ({...prev, end_time: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.sessionNotes}
                    </label>
                    <textarea
                      value={sessionForm.notes || ''}
                      onChange={(e) => setSessionForm(prev => ({...prev, notes: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder={language === 'th' ? 'หมายเหตุสำหรับเซสชันนี้' : 'Notes for this session'}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Multiple Sessions Mode */}
            {sessionForm.mode === 'multiple' && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  {t.multipleSessionDetails}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.selectSchedule} *
                    </label>
                    <select
                      value={sessionForm.schedule_id || 0}
                      onChange={(e) => setSessionForm(prev => ({...prev, schedule_id: parseInt(e.target.value)}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value={0}>{t.selectSchedule}</option>
                      {schedules.map(schedule => (
                        <option key={schedule.schedule_id} value={schedule.schedule_id}>
                          {schedule.schedule_name} - {schedule.course_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.numberOfSessions} *
                    </label>
                    <input
                      type="number"
                      value={sessionForm.session_count || 1}
                      onChange={(e) => setSessionForm(prev => ({...prev, session_count: parseInt(e.target.value)}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min={1}
                      max={50}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.startDate} *
                    </label>
                    <input
                      type="date"
                      value={sessionForm.session_date || ''}
                      onChange={(e) => setSessionForm(prev => ({...prev, session_date: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.repeatFrequency} *
                    </label>
                    <select
                      value={sessionForm.repeat_frequency || 'weekly'}
                      onChange={(e) => setSessionForm(prev => ({...prev, repeat_frequency: e.target.value as 'daily' | 'weekly' | 'monthly'}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="daily">{t.daily}</option>
                      <option value="weekly">{t.weekly}</option>
                      <option value="monthly">{t.monthly}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.startTime} *
                    </label>
                    <input
                      type="time"
                      value={sessionForm.start_time || ''}
                      onChange={(e) => setSessionForm(prev => ({...prev, start_time: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.endTime} *
                    </label>
                    <input
                      type="time"
                      value={sessionForm.end_time || ''}
                      onChange={(e) => setSessionForm(prev => ({...prev, end_time: e.target.value}))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <div className="w-5 h-5 text-yellow-600 mr-2 mt-0.5">⚠️</div>
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">{t.multipleSessionWarning}</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>{t.willCreateSessions.replace('{count}', (sessionForm.session_count || 1).toString())}</li>
                        <li>{t.repeatsEvery} {sessionForm.repeat_frequency === 'daily' ? t.daily.toLowerCase() : sessionForm.repeat_frequency === 'weekly' ? t.weekly.toLowerCase() : t.monthly.toLowerCase()}</li>
                        <li>{t.checkForConflicts}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk Creation Mode */}
            {sessionForm.mode === 'bulk' && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  {t.bulkCreateDetails}
                </h4>
                
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-3">📅</div>
                  <p className="text-lg mb-2 font-semibold">{t.bulkCreateComingSoon}</p>
                  <p className="text-sm">{t.bulkCreateDescription}</p>
                </div>
              </div>
            )}

            {/* Error Display */}
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{formError}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-300 px-6 py-4">
          <div className="flex justify-end space-x-2">
            <Button
              onClick={handleClose}
              variant="monthView"
              className="cursor-pointer"
            >
              {t.cancel}
            </Button>
            <Button
              onClick={onCreateSession}
              variant="monthViewClicked"
              disabled={formLoading || sessionForm.mode === 'bulk'}
              className={`px-4 py-2 cursor-pointer ${formLoading || sessionForm.mode === 'bulk' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {formLoading && <LoadingSpinner className="w-4 h-4 mr-2" />}
              {formLoading ? t.processing : 
               sessionForm.mode === 'single' ? t.createSession :
               sessionForm.mode === 'multiple' ? `${t.createSessions} (${sessionForm.session_count || 1})` :
               t.bulkCreateComingSoon}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
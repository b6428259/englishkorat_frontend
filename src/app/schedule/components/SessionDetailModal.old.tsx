"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Button from "@/components/common/Button";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { scheduleService, SessionDetail, SessionComment, CreateSessionCommentRequest } from "@/services/api/schedules";
import { Clock, Calendar, User, MapPin, Users, FileText, MessageSquare, CheckCircle, XCircle } from "lucide-react";

interface SessionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number;
}

export default function SessionDetailModal({
  isOpen,
  onClose,
  sessionId,
}: SessionDetailModalProps) {
  const { language } = useLanguage();
  
  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null);
  const [sessionComments, setSessionComments] = useState<SessionComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const fetchSessionDetail = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      const response = await scheduleService.getSessionDetail(sessionId.toString());
      setSessionDetail(response.session);
    } catch (error) {
      console.error("Failed to fetch session detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSessionComments = async () => {
    if (!sessionId) return;
    
    try {
      setIsCommentsLoading(true);
      const response = await scheduleService.getSessionComments(sessionId);
      setSessionComments(response.comments);
    } catch (error) {
      console.error("Failed to fetch session comments:", error);
    } finally {
      setIsCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && sessionId) {
      fetchSessionDetail();
      fetchSessionComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, sessionId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !sessionId) return;

    try {
      setIsSubmittingComment(true);
      const commentData: CreateSessionCommentRequest = {
        session_id: sessionId,
        comment: newComment.trim(),
      };
      
      await scheduleService.createSessionComment(commentData);
      setNewComment("");
      await fetchSessionComments();
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US'),
      time: date.toLocaleTimeString(language === 'th' ? 'th-TH' : 'en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { 
        variant: "success" as const, 
        icon: CheckCircle, 
        text: language === 'th' ? 'ยืนยันแล้ว' : 'Confirmed' 
      },
      pending: { 
        variant: "warning" as const, 
        icon: Clock, 
        text: language === 'th' ? 'รอการยืนยัน' : 'Pending' 
      },
      cancelled: { 
        variant: "destructive" as const, 
        icon: XCircle, 
        text: language === 'th' ? 'ยกเลิก' : 'Cancelled' 
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="inline-flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  if (!sessionId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Calendar className="h-6 w-6 text-indigo-600" />
            {language === 'th' ? 'รายละเอียดคาบเรียน' : 'Session Details'}
            <span className="text-lg text-gray-500">#{sessionId}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {language === 'th' ? 'รายละเอียด' : 'Details'}
              </TabsTrigger>
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {language === 'th' ? 'ความคิดเห็น' : 'Comments'} ({sessionComments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <LoadingSpinner size="md" />
                </div>
              ) : sessionDetail ? (
                <div className="space-y-6">
                  {/* Session Status & Basic Info */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {sessionDetail.schedule?.schedule_name}
                      </h3>
                      {getStatusBadge(sessionDetail.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                        <Calendar className="h-5 w-5 text-indigo-600" />
                        <div>
                          <p className="text-sm text-gray-500">{language === 'th' ? 'วันที่' : 'Date'}</p>
                          <p className="font-medium">{formatDateTime(sessionDetail.session_date).date}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                        <Clock className="h-5 w-5 text-indigo-600" />
                        <div>
                          <p className="text-sm text-gray-500">{language === 'th' ? 'เวลา' : 'Time'}</p>
                          <p className="font-medium">
                            {formatDateTime(sessionDetail.start_time).time} - {formatDateTime(sessionDetail.end_time).time}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                        <MapPin className="h-5 w-5 text-indigo-600" />
                        <div>
                          <p className="text-sm text-gray-500">{language === 'th' ? 'ห้องเรียน' : 'Room'}</p>
                          <p className="font-medium">{sessionDetail.room?.room_name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                        <Users className="h-5 w-5 text-indigo-600" />
                        <div>
                          <p className="text-sm text-gray-500">{language === 'th' ? 'ครั้งที่' : 'Session'}</p>
                          <p className="font-medium">
                            {sessionDetail.session_number} / {language === 'th' ? `สัปดาห์ ${sessionDetail.week_number}` : `Week ${sessionDetail.week_number}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Teacher & Room Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Teacher Information */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="h-5 w-5 text-indigo-600" />
                        {language === 'th' ? 'ข้อมูลอาจารย์' : 'Teacher Information'}
                      </h4>
                      
                      {sessionDetail.assigned_teacher && (
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage 
                              src={sessionDetail.assigned_teacher.avatar ? 
                                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${sessionDetail.assigned_teacher.avatar}` : 
                                undefined
                              } 
                              alt={sessionDetail.assigned_teacher.username} 
                            />
                            <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold">
                              {sessionDetail.assigned_teacher.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{sessionDetail.assigned_teacher.username}</p>
                            <p className="text-sm text-gray-600">{sessionDetail.assigned_teacher.email}</p>
                            <p className="text-sm text-gray-600">{sessionDetail.assigned_teacher.phone}</p>
                            {sessionDetail.assigned_teacher.branch && (
                              <p className="text-sm text-indigo-600 mt-1">
                                {sessionDetail.assigned_teacher.branch.name_en}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Room Information */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-indigo-600" />
                        {language === 'th' ? 'ข้อมูลห้องเรียน' : 'Room Information'}
                      </h4>
                      
                      {sessionDetail.room && (
                        <div className="space-y-3">
                          <div>
                            <p className="font-medium text-gray-900">{sessionDetail.room.room_name}</p>
                            <p className="text-sm text-gray-600">
                              {language === 'th' ? 'ความจุ' : 'Capacity'}: {sessionDetail.room.capacity} {language === 'th' ? 'คน' : 'people'}
                            </p>
                          </div>
                          
                          {sessionDetail.room.equipment && sessionDetail.room.equipment.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                {language === 'th' ? 'อุปกรณ์' : 'Equipment'}:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {sessionDetail.room.equipment.map((equipment, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {equipment}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Schedule Information */}
                  {sessionDetail.schedule && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        {language === 'th' ? 'ข้อมูลตารางเรียน' : 'Schedule Information'}
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">{language === 'th' ? 'ชื่อตารางเรียน' : 'Schedule Name'}</p>
                          <p className="font-medium">{sessionDetail.schedule.schedule_name}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">{language === 'th' ? 'ประเภท' : 'Type'}</p>
                          <Badge variant="outline">{sessionDetail.schedule.schedule_type}</Badge>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">{language === 'th' ? 'รูปแบบ' : 'Pattern'}</p>
                          <p className="font-medium">{sessionDetail.schedule.recurring_pattern}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">{language === 'th' ? 'จำนวนชั่วโมงรวม' : 'Total Hours'}</p>
                          <p className="font-medium">{sessionDetail.schedule.total_hours} {language === 'th' ? 'ชั่วโมง' : 'hours'}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">{language === 'th' ? 'ชั่วโมงต่อครั้ง' : 'Hours per Session'}</p>
                          <p className="font-medium">{sessionDetail.schedule.hours_per_session} {language === 'th' ? 'ชั่วโมง' : 'hours'}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">{language === 'th' ? 'ครั้งต่อสัปดาห์' : 'Sessions per Week'}</p>
                          <p className="font-medium">{sessionDetail.schedule.session_per_week}</p>
                        </div>
                      </div>
                      
                      {sessionDetail.schedule.notes && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500 mb-1">{language === 'th' ? 'หมายเหตุ' : 'Notes'}</p>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{sessionDetail.schedule.notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Confirmation Details */}
                  {sessionDetail.confirmed_by && (
                    <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                      <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        {language === 'th' ? 'ข้อมูลการยืนยัน' : 'Confirmation Details'}
                      </h4>
                      
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={sessionDetail.confirmed_by.avatar ? 
                              `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${sessionDetail.confirmed_by.avatar}` : 
                              undefined
                            } 
                            alt={sessionDetail.confirmed_by.username} 
                          />
                          <AvatarFallback className="bg-green-100 text-green-600 font-semibold">
                            {sessionDetail.confirmed_by.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <p className="font-medium text-green-800">{sessionDetail.confirmed_by.username}</p>
                          <p className="text-sm text-green-600">
                            {language === 'th' ? 'ยืนยันเมื่อ' : 'Confirmed at'}: {formatDateTime(sessionDetail.confirmed_at || '').date} {formatDateTime(sessionDetail.confirmed_at || '').time}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Makeup Session Info */}
                  {sessionDetail.is_makeup && (
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                      <p className="text-yellow-800 font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {language === 'th' ? 'นี่คือคาบเรียนชดเชย' : 'This is a makeup session'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 text-gray-500">
                  {language === 'th' ? 'ไม่พบข้อมูลคาบเรียน' : 'Session not found'}
                </div>
              )}
            </TabsContent>

            <TabsContent value="comments" className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4 mb-6">
                  {isCommentsLoading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner size="md" />
                    </div>
                  ) : sessionComments.length > 0 ? (
                    sessionComments.map((comment) => (
                      <div key={comment.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage 
                              src={comment.user?.avatar ? 
                                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/${comment.user.avatar}` : 
                                undefined
                              } 
                              alt={comment.user?.username} 
                            />
                            <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                              {comment.user?.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">
                                {comment.user?.username}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDateTime(comment.created_at).date} {formatDateTime(comment.created_at).time}
                              </span>
                            </div>
                            <p className="text-gray-700">{comment.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        {language === 'th' ? 'ยังไม่มีความคิดเห็น' : 'No comments yet'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator className="my-4" />
              
              {/* Add Comment Section */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex gap-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={language === 'th' ? 'เพิ่มความคิดเห็น...' : 'Add a comment...'}
                    className="flex-1 p-3 border border-gray-300 rounded-lg resize-none h-20 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isSubmittingComment}
                    className="self-end px-6 py-3"
                    variant="monthViewClicked"
                  >
                    {isSubmittingComment ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      language === 'th' ? 'ส่ง' : 'Send'
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { MessageSquare, Settings } from 'lucide-react';

export function SocialMediaPanel() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Social Media Settings</h2>
            <p className="text-sm text-slate-500">Configure API keys and tracking settings for social platforms</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Settings className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Coming Soon</h3>
          <p className="text-slate-500 max-w-md">
            The social media configuration panel is currently under development. 
            Soon you will be able to configure LinkedIn, Twitter, and other platform integrations here.
          </p>
        </div>
      </div>
    </div>
  );
}

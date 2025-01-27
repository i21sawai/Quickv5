'use client';

import { useMemo } from 'react';

import { ThemeToggle } from '@/components/site/theme-toggle';

import LoginBtn from '../atoms/login-btn';
import { useEditorContext } from '../context/editor';
import { Label } from '../ui/label';
import { Spinner } from '../ui/spinner';
import { Switch } from '../ui/switch';

export default function HeaderEnd() {
  const { autosave, setAutosave, page, status } = useEditorContext();

  const statusRender = useMemo(() => {
    switch (status) {
      case 'loading':
        return (
          <span className="flex items-center gap-2">
            <Spinner size="small" />
            ロード中...
          </span>
        );
      case 'saved':
        return <span>保存済み</span>;
      case 'error':
        return <span>保存エラー</span>;
      case 'saving':
        return (
          <span className="flex items-center gap-2">
            <Spinner size="small" />
            保存中...
          </span>
        );
      default:
        return <span>未保存</span>;
    }
  }, [status]);

  return (
    <div className="flex flex-1 items-center justify-end space-x-4">
      <nav className="flex items-center gap-4">
        {page === 'editor' && (
          <div className="flex items-center space-x-2">
            <Switch
              id="autosave"
              checked={autosave}
              onCheckedChange={(e) => setAutosave(e)}
            />
            <Label htmlFor="autosave">自動更新</Label>
            {statusRender}
          </div>
        )}
        <LoginBtn />
        <ThemeToggle />
      </nav>
    </div>
  );
}

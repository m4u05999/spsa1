/**
 * Enhanced Message Component Tests
 * اختبارات مكون الرسائل المحسنة
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import EnhancedMessage, { FieldErrorMessage, LoadingMessage, EmptyStateMessage } from '../EnhancedMessage';

// Mock timers for auto-hide functionality
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe('EnhancedMessage Component', () => {
  it('يجب أن يعرض رسالة خطأ بشكل صحيح', () => {
    render(
      <EnhancedMessage
        type="error"
        message="حدث خطأ في النظام"
        title="خطأ"
      />
    );

    expect(screen.getByText('خطأ')).toBeInTheDocument();
    expect(screen.getByText('حدث خطأ في النظام')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50', 'border-red-500', 'text-red-800');
  });

  it('يجب أن يعرض رسالة نجاح بشكل صحيح', () => {
    render(
      <EnhancedMessage
        type="success"
        message="تم الحفظ بنجاح"
      />
    );

    expect(screen.getByText('تم الحفظ بنجاح')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-green-50', 'border-green-500', 'text-green-800');
  });

  it('يجب أن يعرض رسالة تحذير بشكل صحيح', () => {
    render(
      <EnhancedMessage
        type="warning"
        message="تحذير: البيانات غير محفوظة"
      />
    );

    expect(screen.getByText('تحذير: البيانات غير محفوظة')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-yellow-50', 'border-yellow-500', 'text-yellow-800');
  });

  it('يجب أن يعرض رسالة معلومات بشكل صحيح', () => {
    render(
      <EnhancedMessage
        type="info"
        message="معلومات مفيدة"
      />
    );

    expect(screen.getByText('معلومات مفيدة')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-blue-50', 'border-blue-500', 'text-blue-800');
  });

  it('يجب أن يستدعي onClose عند النقر على زر الإغلاق', () => {
    const onCloseMock = vi.fn();
    
    render(
      <EnhancedMessage
        type="info"
        message="رسالة اختبار"
        onClose={onCloseMock}
      />
    );

    const closeButton = screen.getByLabelText('إغلاق الرسالة');
    fireEvent.click(closeButton);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('يجب أن يخفي الرسالة تلقائياً بعد المدة المحددة', async () => {
    const onCloseMock = vi.fn();
    
    render(
      <EnhancedMessage
        type="info"
        message="رسالة اختبار"
        onClose={onCloseMock}
        autoHide={true}
        duration={3000}
      />
    );

    // Fast-forward time
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('يجب أن يعرض الأيقونة بشكل افتراضي', () => {
    render(
      <EnhancedMessage
        type="success"
        message="رسالة اختبار"
      />
    );

    const icon = screen.getByRole('alert').querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('يجب أن يخفي الأيقونة عند تعيين showIcon إلى false', () => {
    render(
      <EnhancedMessage
        type="success"
        message="رسالة اختبار"
        showIcon={false}
      />
    );

    const icon = screen.getByRole('alert').querySelector('svg');
    expect(icon).not.toBeInTheDocument();
  });

  it('يجب أن يعرض الأزرار المخصصة', () => {
    const action1Mock = vi.fn();
    const action2Mock = vi.fn();
    
    const actions = [
      { label: 'تأكيد', onClick: action1Mock, variant: 'primary' },
      { label: 'إلغاء', onClick: action2Mock, variant: 'secondary' }
    ];

    render(
      <EnhancedMessage
        type="warning"
        message="هل تريد المتابعة؟"
        actions={actions}
      />
    );

    const confirmButton = screen.getByText('تأكيد');
    const cancelButton = screen.getByText('إلغاء');

    expect(confirmButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();

    fireEvent.click(confirmButton);
    fireEvent.click(cancelButton);

    expect(action1Mock).toHaveBeenCalledTimes(1);
    expect(action2Mock).toHaveBeenCalledTimes(1);
  });

  it('يجب ألا يعرض شيئاً عندما تكون الرسالة فارغة', () => {
    const { container } = render(
      <EnhancedMessage
        type="info"
        message=""
      />
    );

    expect(container.firstChild).toBeNull();
  });
});

describe('FieldErrorMessage Component', () => {
  it('يجب أن يعرض رسالة خطأ الحقل', () => {
    render(<FieldErrorMessage error="هذا الحقل مطلوب" />);

    expect(screen.getByText('هذا الحقل مطلوب')).toBeInTheDocument();

    // Check the parent div has the correct classes
    const errorContainer = screen.getByText('هذا الحقل مطلوب').closest('div');
    expect(errorContainer).toHaveClass('text-red-600');
  });

  it('يجب ألا يعرض شيئاً عندما لا يوجد خطأ', () => {
    const { container } = render(<FieldErrorMessage error="" />);

    expect(container.firstChild).toBeNull();
  });

  it('يجب أن يعرض أيقونة الخطأ', () => {
    render(<FieldErrorMessage error="خطأ في الحقل" />);

    const icon = screen.getByText('خطأ في الحقل').parentElement.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});

describe('LoadingMessage Component', () => {
  it('يجب أن يعرض رسالة التحميل الافتراضية', () => {
    render(<LoadingMessage />);

    expect(screen.getByText('جاري التحميل...')).toBeInTheDocument();
  });

  it('يجب أن يعرض رسالة التحميل المخصصة', () => {
    render(<LoadingMessage message="جاري حفظ البيانات..." />);

    expect(screen.getByText('جاري حفظ البيانات...')).toBeInTheDocument();
  });

  it('يجب أن يعرض أيقونة التحميل المتحركة', () => {
    const { container } = render(<LoadingMessage />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});

describe('EmptyStateMessage Component', () => {
  it('يجب أن يعرض رسالة الحالة الفارغة الافتراضية', () => {
    render(<EmptyStateMessage />);

    expect(screen.getByText('لا توجد بيانات للعرض')).toBeInTheDocument();
  });

  it('يجب أن يعرض رسالة مخصصة', () => {
    render(<EmptyStateMessage message="لا توجد نتائج للبحث" />);

    expect(screen.getByText('لا توجد نتائج للبحث')).toBeInTheDocument();
  });

  it('يجب أن يعرض الأيقونة المخصصة', () => {
    const customIcon = <div data-testid="custom-icon">أيقونة مخصصة</div>;
    
    render(<EmptyStateMessage icon={customIcon} />);

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('يجب أن يعرض زر الإجراء ويستدعي onClick', () => {
    const actionMock = vi.fn();
    const action = { label: 'إضافة جديد', onClick: actionMock };
    
    render(<EmptyStateMessage action={action} />);

    const actionButton = screen.getByText('إضافة جديد');
    expect(actionButton).toBeInTheDocument();

    fireEvent.click(actionButton);
    expect(actionMock).toHaveBeenCalledTimes(1);
  });
});

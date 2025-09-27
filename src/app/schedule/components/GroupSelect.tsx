import { memo, useCallback, useMemo } from "react";

import { SearchableSelect } from "@/components/ui/searchable-select";
import type { GroupOption } from "@/types/group.types";

type GroupSelectProps = {
  groups: GroupOption[];
  value?: number;
  onChange: (groupId?: number) => void;
  language: string;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

type PaymentStatusKey = "pending" | "deposit_paid" | "fully_paid";

const PAYMENT_STATUS_LABELS: Record<
  "th" | "en",
  Record<PaymentStatusKey, string>
> = {
  en: {
    pending: "Payment: Pending",
    deposit_paid: "Payment: Deposit paid",
    fully_paid: "Payment: Fully paid",
  },
  th: {
    pending: "สถานะชำระเงิน: รอการชำระ",
    deposit_paid: "สถานะชำระเงิน: ชำระมัดจำแล้ว",
    fully_paid: "สถานะชำระเงิน: ชำระเต็มจำนวน",
  },
};

const formatPaymentStatus = (status: string, language: "th" | "en") => {
  const normalized = status as PaymentStatusKey;
  const labels = PAYMENT_STATUS_LABELS[language];
  return labels[normalized] ?? undefined;
};

export const GroupSelect = memo(function GroupSelect({
  groups,
  value,
  onChange,
  language,
  disabled,
  loading,
  className,
}: GroupSelectProps) {
  const langKey: "th" | "en" = language === "th" ? "th" : "en";

  const options = useMemo(() => {
    const locale = langKey === "th" ? "th" : "en";
    const studentLabel = langKey === "th" ? "นักเรียน" : "Students";

    return [...groups]
      .sort((a, b) => a.group_name.localeCompare(b.group_name, locale))
      .map((group) => {
        const paymentText = formatPaymentStatus(group.payment_status, langKey);
        const descriptionParts = [
          group.course_name,
          group.level
            ? langKey === "th"
              ? `ระดับ ${group.level}`
              : `Level ${group.level}`
            : undefined,
          `${studentLabel} ${group.current_students}/${group.max_students}`,
          paymentText,
        ].filter(Boolean) as string[];

        return {
          value: group.id.toString(),
          label: group.group_name,
          description: descriptionParts.join(" | "),
        };
      });
  }, [groups, langKey]);

  const selectedValue =
    typeof value === "number" && Number.isFinite(value) && value > 0
      ? value.toString()
      : undefined;

  const handleValueChange = useCallback(
    (nextValue: string | number) => {
      if (nextValue === "" || nextValue === null || nextValue === undefined) {
        onChange(undefined);
        return;
      }

      const numeric =
        typeof nextValue === "number"
          ? nextValue
          : Number.parseInt(nextValue, 10);

      onChange(Number.isFinite(numeric) && numeric > 0 ? numeric : undefined);
    },
    [onChange],
  );

  return (
    <SearchableSelect
      options={options}
      value={selectedValue}
      onValueChange={handleValueChange}
      placeholder={langKey === "th" ? "เลือกกลุ่ม" : "Select Group"}
      emptyText={langKey === "th" ? "ไม่พบกลุ่ม" : "No groups found"}
      searchPlaceholder={
        langKey === "th" ? "ค้นหากลุ่ม..." : "Search groups..."
      }
      disabled={disabled}
      loading={loading}
      allowClear
      className={className}
      maxDisplayLength={60}
    />
  );
});

GroupSelect.displayName = "GroupSelect";


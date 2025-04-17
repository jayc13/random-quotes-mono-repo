import { Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { QuoteList } from "../quotes";

export const CategoryShow = () => {
  const { queryResult } = useShow({});
  const { data, isLoading } = queryResult;

  const record = data?.data;

  return (
    <Show isLoading={isLoading} title={`Category - ${record?.name}`} canEdit>
      {record?.id && <QuoteList categoryId={record.id.toString()} />}
    </Show>
  );
};

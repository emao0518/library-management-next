import { getUserList, userDelete, userUpdate } from "@/api";
import { Content } from "@/components";
import { USER_STATUS } from "@/constants";
import { BookType, CategoryType, UserQueryType, UserType } from "@/types";
import { useCurrentUser } from "@/utils/hoos";
import { ExclamationCircleFilled } from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  TablePaginationConfig,
  Tag,
  message,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

import styles from "./index.module.css";

const Option = Select.Option;

const COLUMNS = [
  {
    title: "Username",
    dataIndex: "name",
    key: "name",
    ellipsis: true,
    width: 200,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    width: 150,
    render: (text: string) =>
      text === "on" ? (
        <Tag color="green">Active</Tag>
      ) : (
        <Tag color="red">Deactive</Tag>
      ),
  },
  {
    title: "Registered Date",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 200,
    render: (text: number) => {
      return dayjs(text).format("MM-DD-YYYY");
    },
  },
];

export default function Book() {
  const [form] = Form.useForm();
  const user = useCurrentUser();
  const [list, setList] = useState<UserType[]>([]);

  const [categoryList, setCategoryList] = useState<CategoryType[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 20,
    showSizeChanger: true,
  });
  const [editData, setEditData] = useState<Partial<BookType>>({});
  const router = useRouter();

  const columns = [
    ...COLUMNS,
    {
      title: "Action",
      dataIndex: "",
      key: "action",
      render: (_: any, row: UserType) => (
        <Space>
          <Button
            type="link"
            onClick={() => {
              setEditData(row);
              router.push(`/user/edit/${row._id}`);
            }}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger={row.status === USER_STATUS.ON}
            onClick={() => {
              handleStatusUpdate(row);
            }}
          >
            {row.status === USER_STATUS.ON ? "Deactivate" : "Activate"}
          </Button>
          <Button
            type="link"
            danger
            onClick={() => {
              handleDeleteModal(row._id as string);
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const fetchData = useCallback(
    (search?: UserQueryType) => {
      const { name, status } = search || {};
      getUserList({
        current: pagination.current as number,
        pageSize: pagination.pageSize as number,
        ...(name && { name }),
        ...(status && { status }),
      }).then((res) => {
        setList(res.data);
        setTotal(res.total);
      });
    },
    [pagination]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData, pagination]);

  const handleAdd = () => {
    router.push("/user/add");
  };

  const handleDeleteModal = (_id: string) => {
    Modal.confirm({
      title: "Are you sure to delete it?",
      icon: <ExclamationCircleFilled />,
      okText: "Confirm",
      cancelText: "Cancel",
      async onOk() {
        await userDelete(_id);
        message.success("Delete successfully!");
        fetchData(form.getFieldsValue());
      },
    });
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPagination(pagination);
  };

  const handleSearchFinish = (values: UserQueryType) => {
    fetchData(values);
  };

  const handleStatusUpdate = async (row: UserType) => {
    await userUpdate(row._id as string, {
      ...row,
      status: row.status === USER_STATUS.ON ? USER_STATUS.OFF : USER_STATUS.ON,
    });
    fetchData(form.getFieldsValue());
  };

  return (
    <>
      <Content
        title="All Users"
        operation={
          <Button type="primary" onClick={handleAdd}>
            Add
          </Button>
        }
      >
        <Form
          form={form}
          name="search"
          className={styles.form}
          onFinish={handleSearchFinish}
        >
          <Row gutter={24}>
            <Col span={5}>
              <Form.Item name="name" label="Username">
                <Input placeholder="Please enter" allowClear />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="status" label="Status">
                <Select placeholder="Please select" allowClear>
                  <Option key={USER_STATUS.ON} value={USER_STATUS.ON}>
                    Active
                  </Option>
                  <Option key={USER_STATUS.OFF} value={USER_STATUS.OFF}>
                    Deactive
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={9} style={{ textAlign: "left" }}>
              <Button type="primary" htmlType="submit">
                Search
              </Button>
              <Button
                style={{ margin: "0 8px" }}
                onClick={() => {
                  form.resetFields();
                }}
              >
                Clear
              </Button>
            </Col>
          </Row>
        </Form>
        <div className={styles.tableWrap}>
          <Table
            rowKey="_id"
            dataSource={list}
            columns={columns}
            onChange={handleTableChange}
            pagination={{
              ...pagination,
              total: total,
              showTotal: () => `${total} in total`,
            }}
          />
        </div>
      </Content>
    </>
  );
}

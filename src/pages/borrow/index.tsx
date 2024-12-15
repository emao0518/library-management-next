import {
  borrowBack,
  borrowDelete,
  getBookList,
  getBorrowList,
  getCategoryList,
} from "@/api";
import { AuthHoc, Content, Layout } from "@/components";
import { BORROW_STATUS } from "@/constants";
import { BookType, BorrowQueryType, BorrowType, CategoryType } from "@/types";
import { useCurrentUser } from "@/utils/hoos";
import { ExclamationCircleFilled } from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
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
    title: "Book Name",
    dataIndex: "bookName",
    key: "bookName",
    ellipsis: true,
    width: 180,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    ellipsis: true,
    width: 130,
    render: (text: string) =>
      text === "on" ? (
        <Tag color="red">Checked out</Tag>
      ) : (
        <Tag color="green">Returned</Tag>
      ),
  },
  {
    title: "Author",
    dataIndex: "author",
    key: "author",
    ellipsis: true,
    width: 150,
  },
  {
    title: "Checked out by",
    dataIndex: "borrowUser",
    key: "borrowUser",
    ellipsis: true,
    width: 150,
  },
  {
    title: "Checkout date",
    dataIndex: "borrowAt",
    key: "borrowAt",
    width: 130,
    render: (text: string) => dayjs(text).format("YYYY-MM-DD"),
  },
  {
    title: "Returned date",
    dataIndex: "backAt",
    key: "backAt",
    width: 130,
    render: (text: string) => (text ? dayjs(text).format("YYYY-MM-DD") : "-"),
  },
];

export default function Borrow() {
  const [form] = Form.useForm();
  const [list, setList] = useState<BorrowType[]>([]);
  const [categoryList, setCategoryList] = useState<CategoryType[]>([]);
  const [bookList, setBookList] = useState<BookType[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 20,
    showSizeChanger: true,
  });
  const router = useRouter();

  const columns = [
    ...COLUMNS,
    {
      title: "Action",
      dataIndex: "",
      key: "action",
      render: (_: any, row: BorrowType) => (
        <Space>
          {row.status === BORROW_STATUS.ON ? (
            <Button
              type="link"
              block
              onClick={() => {
                handleBorrowBack(row._id as string);
              }}
              size="small"
            >
              Checkout
            </Button>
          ) : null}
          <AuthHoc>
            <Button
              type="link"
              block
              onClick={() => {
                router.push(`/borrow/edit/${row._id}`);
              }}
              size="small"
            >
              Edit
            </Button>
          </AuthHoc>
          <AuthHoc>
            <Button
              type="link"
              block
              danger
              onClick={() => {
                handleDeleteModal(row._id as string);
              }}
              size="small"
            >
              Delete
            </Button>
          </AuthHoc>
        </Space>
      ),
    },
  ];

  const fetchData = useCallback(
    (search?: BorrowQueryType) => {
      const { book, user, author, status } = search || {};
      getBorrowList({
        current: pagination.current as number,
        pageSize: pagination.pageSize as number,
        book,
        author,
        user,
        status,
      }).then((res) => {
        const data = res.data.map((item: BorrowType) => ({
          ...item,
          bookName: item.book.name,
          author: item.book.author,
          borrowUser: item.user.name,
        }));
        setList(data);
        setTotal(res.total);
      });
    },
    [pagination]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData, pagination]);

  useEffect(() => {
    getCategoryList({ all: true }).then((res) => {
      setCategoryList(res.data);
    });
    getBookList({ all: true }).then((res) => {
      setBookList(res.data);
    });
  }, []);

  const handleBorrowBack = (id: string) => {
    Modal.confirm({
      title: "Confirm to checkout?",
      icon: <ExclamationCircleFilled />,
      okText: "Confirm",
      cancelText: "Cancel",
      async onOk() {
        await borrowBack(id);
        message.success("Checkout successfully!");
        fetchData(form.getFieldsValue());
      },
    });
  };

  const handleDeleteModal = (id: string) => {
    Modal.confirm({
      title: "Are you sure to delete it?",
      icon: <ExclamationCircleFilled />,
      okText: "Confirm",
      cancelText: "Cancel",
      async onOk() {
        await borrowDelete(id);
        fetchData(form.getFieldsValue());
        message.success("Delete successfully!");
      },
    });
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPagination(pagination);
  };

  const handleSearchFinish = (values: BorrowQueryType) => {
    fetchData(values);
  };

  return (
    <Content title="Checkout Records">
      <Form
        form={form}
        name="search"
        className={styles.form}
        onFinish={handleSearchFinish}
      >
        <Row gutter={24}>
          <Col span={5}>
            <Form.Item name="book" label="Book Name">
              <Select
                showSearch
                placeholder="Please select"
                optionFilterProp="label"
                allowClear
                options={bookList.map((item) => ({
                  label: item.name,
                  value: item._id,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item name="status" label="Status">
              <Select
                showSearch
                placeholder="Please select"
                optionFilterProp="label"
                allowClear
                options={[
                  { label: "Checked out", value: BORROW_STATUS.ON },
                  { label: "Returned", value: BORROW_STATUS.OFF },
                ]}
              />
            </Form.Item>
          </Col>
          <AuthHoc>
            <Col span={5}>
              <Form.Item name="user" label="Checked out by">
                <Select placeholder="Please select" allowClear>
                  {categoryList.map((category) => (
                    <Option key={category._id} value={category._id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </AuthHoc>
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
          scroll={{ x: 1300 }}
          pagination={{
            ...pagination,
            total: total,
            showTotal: () => `${total} in total`,
          }}
        />
      </div>
    </Content>
  );
}

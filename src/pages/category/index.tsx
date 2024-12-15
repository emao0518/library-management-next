import { categoryAdd, categoryDelete, categoryUpdate } from "@/api/category";
import { Content } from "@/components";
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
import qs from "qs";
import { useCallback, useEffect, useState } from "react";

import { CategoryQueryType, CategoryType } from "../../types";
import request from "../../utils/request";
import styles from "./index.module.css";

const Option = Select.Option;

const LEVEL = {
  ONE: 1,
  TWO: 2,
};

const LEVEL_OPTION = [
  { label: "Level 1", value: LEVEL.ONE },
  { label: "Level 2", value: LEVEL.TWO },
];

const COLUMNS = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    ellipsis: true,
    width: 200,
  },
  {
    title: "Level",
    dataIndex: "level",
    key: "level",
    ellipsis: true,
    width: 200,
    render: (text: number) => (
      <Tag color={text === 1 ? "green" : "cyan"}>{`Level ${text}`}</Tag>
    ),
  },
  {
    title: "Parent Category",
    dataIndex: "parent",
    key: "parent",
    ellipsis: true,
    width: 200,
    render: (text: { name: string }) => {
      return text?.name ?? "-";
    },
  },
  {
    title: "Created Date",
    dataIndex: "createdAt",
    key: "createdAt",
    width: 200,
    render: (text: string) => dayjs(text).format("MM-DD-YYYY"),
  },
];

export default function Book() {
  const [form] = Form.useForm();
  const [isModalOpen, setModalOpen] = useState(false);
  const [list, setList] = useState<CategoryType[]>([]);
  const [total, setTotal] = useState(0);
  const [formLevel, setFormLevel] = useState<number>();
  const [levelOneList, setLevelOneList] = useState<CategoryType[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 20,
    showSizeChanger: true,
  });
  const [editData, setEditData] = useState<Partial<CategoryType>>({});

  const columns = [
    ...COLUMNS,
    {
      title: "Action",
      dataIndex: "",
      key: "action",
      render: (_: any, row: CategoryType) => (
        <Space>
          <Button
            type="link"
            block
            onClick={() => {
              fetchLevelOneData();
              setModalOpen(true);
              setEditData(row);
            }}
          >
            Eidt
          </Button>
          <Button
            type="link"
            danger
            block
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
    (search?: CategoryQueryType) => {
      const { name, level } = search || {};

      request
        .get(
          `/api/categories?${qs.stringify({
            current: pagination.current,
            pageSize: pagination.pageSize,
            name,
            level,
          })}`
        )
        .then((res) => {
          setList(res.data);
          setTotal(res.total);
        });
    },
    [pagination]
  );


  const fetchLevelOneData = useCallback(() => {
    request
      .get(
        `/api/categories?${qs.stringify({
          level: 1,
          all: true,
        })}`
      )
      .then((res) => {
        setLevelOneList(res.data);
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, fetchLevelOneData, pagination]);

  const handleEditCategoryFinish = async (values: CategoryType) => {
    if (editData._id) {
      await categoryUpdate(editData._id, values);
      message.success("Edited successfully!");
    } else {
      await categoryAdd(values);
      message.success("Created successfully!");
    }
    fetchData();
    handleCancel();
  };

  const handleOk = async () => {
    form.submit();
  };

  const handleCancel = () => {
    setEditData({});
    setModalOpen(false);
  };

  const handleDeleteModal = (id: string) => {
    Modal.confirm({
      title: "Are you sure to delete it?",
      icon: <ExclamationCircleFilled />,
      okText: "Confirm",
      cancelText: "Cancel",
      async onOk() {
        await categoryDelete(id);
        message.success("Delete successfully!");
        fetchData(form.getFieldsValue());
      },
    });
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPagination(pagination);
  };

  const handleSearchFinish = (values: CategoryQueryType) => {
    fetchData(values);
  };

  const handleCategoryAdd = () => {
    fetchLevelOneData();
    setModalOpen(true);
    setTimeout(() => {
      form.resetFields();
    });
  };

  const handleFormLevelChange = (value: number) => {
    setFormLevel(value);
  };

  return (
    <>
      <Content
        title="All Categories"
        operation={
          <Button type="primary" onClick={handleCategoryAdd}>
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
              <Form.Item name="name" label="Name">
                <Input placeholder="Please enter" allowClear />
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="level" label="Level">
                <Select
                  allowClear
                  placeholder="Please select"
                  options={LEVEL_OPTION}
                ></Select>
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
                  fetchData();
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
        {isModalOpen && (
          <Modal
            title={editData._id ? "Edit Category" : "Add a Category"}
            open={isModalOpen}
            onOk={handleOk}
            okText="Confirm"
            cancelText="Cancel"
            onCancel={handleCancel}
          >
            <Form
              name="category"
              form={form}
              // labelCol={{ span: 4 }}
              // wrapperCol={{ span: 20 }}
              style={{ maxWidth: 700 }}
              initialValues={editData ? editData : {}}
              onFinish={handleEditCategoryFinish}
              autoComplete="off"
              layout="vertical"
            >
              <Form.Item
                label="Name"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Please enter name",
                  },
                ]}
              >
                <Input placeholder="Please enter" />
              </Form.Item>
              <Form.Item
                label="Level"
                name="level"
                rules={[
                  {
                    required: true,
                    message: "Please select level",
                  },
                ]}
              >
                <Select
                  placeholder="Please select"
                  options={LEVEL_OPTION}
                  onChange={handleFormLevelChange}
                />
              </Form.Item>
              {formLevel === LEVEL.TWO && (
                <Form.Item
                  label="Parent Category"
                  name="parent"
                  rules={[
                    {
                      required: true,
                      message: "Please select parent category",
                    },
                  ]}
                >
                  <Select placeholder="Please select">
                    {levelOneList.map((item) => (
                      <Option key={item._id} value={item._id}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
            </Form>
          </Modal>
        )}
      </Content>
    </>
  );
}

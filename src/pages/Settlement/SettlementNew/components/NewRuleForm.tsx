import { FC, useState } from 'react';
import { Form, Input, InputNumber, Space, Button, Divider, Row, Col, Typography, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { CommissionRule, LadderTier } from '../../../../types/commissionRule';
import dayjs from 'dayjs';

const { Text } = Typography;

interface NewRuleFormProps {
    onCancel: () => void;
    onSuccess: (rule: CommissionRule) => void;
}

const NewRuleForm: FC<NewRuleFormProps> = ({ onCancel, onSuccess }) => {
    const [form] = Form.useForm();

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            // 校验区间合理性
            const tiers: LadderTier[] = values.tiers;
            const sortedTiers = [...tiers].sort((a, b) => a.min - b.min);

            for (let i = 0; i < sortedTiers.length; i++) {
                if (sortedTiers[i].max !== null && sortedTiers[i].min >= sortedTiers[i].max!) {
                    message.error(`梯度 ${i + 1} 的最小值必须小于最大值`);
                    return;
                }
                if (i > 0 && sortedTiers[i].min !== sortedTiers[i - 1].max) {
                    message.error(`梯度 ${i + 1} 的起始值必须等于上一个梯度的截止值`);
                    return;
                }
            }
            if (sortedTiers[0].min !== 0) {
                message.error('第一个梯度的起始值必须为 0');
                return;
            }

            const newRule: CommissionRule = {
                ...values,
                id: `TEMP_${Date.now()}`,
                status: 'enabled',
                isDefault: false,
                creator: '当前用户',
                createTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
            };

            onSuccess(newRule);
        } catch (error) {
            console.error('Validate Failed:', error);
        }
    };

    return (
        <Form form={form} layout="vertical" initialValues={{
            name: '',
            tiers: [{ min: 0, max: 50, rate: 20 }]
        }}>
            <Form.Item name="name" label="规则名称" rules={[{ required: true, message: '请输入规则名称' }]}>
                <Input placeholder="例如：某某渠道专项激励规则" />
            </Form.Item>

            <Divider dashed>分佣梯度配置</Divider>

            <Form.List name="tiers">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }, index) => (
                            <div key={key}>
                                <Row gutter={12} align="middle">
                                    <Col span={7}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'min']}
                                            label={index === 0 ? "业绩起点(万)" : ""}
                                            rules={[{ required: true }]}
                                        >
                                            <InputNumber style={{ width: '100%' }} disabled={index === 0} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={1} style={{ textAlign: 'center', paddingTop: index === 0 ? 30 : 5 }}>至</Col>
                                    <Col span={7}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'max']}
                                            label={index === 0 ? "业绩终点(万)" : ""}
                                        >
                                            <InputNumber style={{ width: '100%' }} placeholder="无上限" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            {...restField}
                                            name={[name, 'rate']}
                                            label={index === 0 ? "比例(%)" : ""}
                                            rules={[{ required: true }]}
                                        >
                                            <InputNumber style={{ width: '100%' }} min={0} max={100} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={3} style={{ paddingTop: index === 0 ? 30 : 5 }}>
                                        {fields.length > 1 && (
                                            <Button type="link" danger icon={<DeleteOutlined />} onClick={() => remove(name)} />
                                        )}
                                    </Col>
                                </Row>
                            </div>
                        ))}
                        <Form.Item>
                            <Button type="dashed" onClick={() => {
                                const lastTier = form.getFieldValue(['tiers', fields.length - 1]);
                                add({
                                    min: lastTier?.max || 0,
                                    max: lastTier?.max ? lastTier.max + 50 : null,
                                    rate: (lastTier?.rate || 0) + 5
                                });
                            }} block icon={<PlusOutlined />}>
                                添加梯度
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form.List>

            <div style={{ textAlign: 'right', marginTop: 24 }}>
                <Space>
                    <Button onClick={onCancel}>取消</Button>
                    <Button type="primary" onClick={handleSave} style={{ background: '#ff5050', borderColor: '#ff5050' }}>确认并应用</Button>
                </Space>
            </div>
        </Form>
    );
};

export default NewRuleForm;

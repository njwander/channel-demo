import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { Card, Typography, Breadcrumb, Space, Divider, Skeleton } from 'antd';
import { FileTextOutlined, HomeOutlined } from '@ant-design/icons';
// @ts-ignore
import content from '../../../docs/business-rules.md?raw';

const { Title, Text } = Typography;

// Initialize mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'Inter, system-ui, sans-serif',
});

const Mermaid: React.FC<{ chart: string }> = ({ chart }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        const renderChart = async () => {
            if (!chart) return;
            try {
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                const { svg } = await mermaid.render(id, chart);
                setSvg(svg);
                setError(false);
            } catch (err) {
                console.error('Mermaid rendering error:', err);
                setError(true);
            }
        };

        renderChart();
    }, [chart]);

    if (error) {
        return (
            <Card size="small" style={{ background: '#fff1f0', borderColor: '#ffa39e', margin: '16px 0' }}>
                <Text type="danger">Mermaid 图表渲染失败，请检查语法。</Text>
                <pre style={{ marginTop: 8, fontSize: '12px' }}>{chart}</pre>
            </Card>
        );
    }

    return (
        <div
            ref={ref}
            className="mermaid-container"
            style={{
                margin: '24px 0',
                display: 'flex',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.5)',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
};

const BusinessRules: React.FC = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate some loading for aesthetic effect
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
            <Breadcrumb style={{ marginBottom: 24 }}>
                <Breadcrumb.Item href="/">
                    <HomeOutlined />
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                    <FileTextOutlined />
                    <span style={{ marginLeft: 8 }}>业务规则</span>
                </Breadcrumb.Item>
            </Breadcrumb>

            <div style={{ marginBottom: 32 }}>
                <Title level={2} style={{
                    margin: 0,
                    background: 'linear-gradient(90deg, #1677ff 0%, #722ed1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 800
                }}>
                    业务规则中心
                </Title>
                <Text type="secondary">本页面内容同步自系统 PRD 文档，旨在为业务人员提供最新的规则指引。</Text>
            </div>

            <Card
                bordered={false}
                style={{
                    borderRadius: 16,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.5)'
                }}
            >
                {loading ? (
                    <Skeleton active paragraph={{ rows: 15 }} />
                ) : (
                    <div className="markdown-body">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const lang = match ? match[1] : '';

                                    if (!inline && lang === 'mermaid') {
                                        return <Mermaid chart={String(children).replace(/\n$/, '')} />;
                                    }

                                    return (
                                        <code className={className} {...props} style={{
                                            backgroundColor: 'rgba(0,0,0,0.04)',
                                            padding: '2px 4px',
                                            borderRadius: '4px',
                                            fontSize: '90%'
                                        }}>
                                            {children}
                                        </code>
                                    );
                                },
                                h1: ({ children }) => <Title level={1} style={{ marginTop: 48, marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #f0f0f0' }}>{children}</Title>,
                                h2: ({ children }) => <Title level={2} style={{ marginTop: 40, marginBottom: 20 }}>{children}</Title>,
                                h3: ({ children }) => <Title level={3} style={{ marginTop: 32, marginBottom: 16 }}>{children}</Title>,
                                p: ({ children }) => <p style={{ marginBottom: 16, lineHeight: 1.8, color: '#434343' }}>{children}</p>,
                                ul: ({ children }) => <ul style={{ marginBottom: 16, paddingLeft: 24 }}>{children}</ul>,
                                li: ({ children }) => <li style={{ marginBottom: 8 }}>{children}</li>,
                                table: ({ children }) => (
                                    <div style={{ overflowX: 'auto', marginBottom: 24 }}>
                                        <table style={{
                                            width: '100%',
                                            borderCollapse: 'collapse',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            border: '1px solid #f0f0f0'
                                        }}>
                                            {children}
                                        </table>
                                    </div>
                                ),
                                thead: ({ children }) => <thead style={{ backgroundColor: '#fafafa', textAlign: 'left' }}>{children}</thead>,
                                th: ({ children }) => <th style={{ padding: '12px 16px', border: '1px solid #f0f0f0', fontWeight: 600 }}>{children}</th>,
                                td: ({ children }) => <td style={{ padding: '12px 16px', border: '1px solid #f0f0f0' }}>{children}</td>,
                                blockquote: ({ children }) => (
                                    <blockquote style={{
                                        margin: '24px 0',
                                        padding: '16px 24px',
                                        borderLeft: '4px solid #1677ff',
                                        backgroundColor: '#e6f4ff',
                                        borderRadius: '0 8px 8px 0',
                                        color: '#003a8c'
                                    }}>
                                        {children}
                                    </blockquote>
                                ),
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                )}
            </Card>

            <style>{`
        .markdown-body img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .markdown-body pre {
          background-color: #f6f8fa;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          overflow: auto;
        }
        .mermaid-container svg {
          max-width: 100% !important;
          height: auto !important;
        }
      `}</style>
        </div>
    );
};

export default BusinessRules;

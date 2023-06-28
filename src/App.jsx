import { ConfigProvider, notification, Spin } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { Auth } from 'aws-amplify';
import locale from 'antd/locale/it_IT';
import { getCategory, getUser } from './services/apiManager';
import Router from './components/router/Router';

export default function App() {
    const firstUpdate = useRef(true);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [categories, setCategories] = useState(null);

    const [api, contextHolder] = notification.useNotification();
    const openNotification = (title, text, type) => {
        api[type ? type : 'info']({
            message: title,
            description: text,
            placement: 'topRight',
            style: { marginTop: 44 },
            duration: 2,
        });
    };

    useEffect(() => {
        if (!firstUpdate.current) localStorage.setItem('connectedUser', JSON.stringify(user));
    }, [user]);

    useEffect(() => {
        if (firstUpdate.current) {
            firstUpdate.current = false;
            const connectedUser = JSON.parse(localStorage.getItem('connectedUser'));
            if (connectedUser) {
                setUser(connectedUser);
                setLoading(false);
            } else {
                Auth.currentUserInfo().then((r) => {
                    if (r)
                        getUser(r.attributes.email).then((r) => {
                            setUser(r.data);
                            setLoading(false);
                        });
                    else setLoading(false);
                });
            }
            getCategory('all').then((r) => {
                setCategories(r.data);
            });
        }
    }, []);

    return (
        <ConfigProvider locale={locale}>
            <Spin spinning={loading} size="large" tip="Effettuando l'accesso...">
                {contextHolder}
                <Router user={user} setUser={setUser} openNotification={openNotification} categories={categories} />
            </Spin>
        </ConfigProvider>
    );
}

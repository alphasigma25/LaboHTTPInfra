<?php
    $static_app1 = getenv('STATIC_APP1');
    $dynamic_app1 = getenv('DYNAMIC_APP1');

    $static_app2 = getenv('STATIC_APP2');
    $dynamic_app2 = getenv('DYNAMIC_APP2');
?>
<VirtualHost *:80>
	ServerName demo.res.ch

    <Proxy balancer://dynamic_cluster>
        BalancerMember 'http://<?php echo "$dynamic_app1"?>'
        BalancerMember 'http://<?php echo "$dynamic_app2"?>'
    </Proxy>
    <Proxy balancer://static_cluster>
        BalancerMember 'http://<?php echo "$static_app1"?>'
        BalancerMember 'http://<?php echo "$static_app2"?>'
    </Proxy>

	ProxyPass '/api/spells/' 'balancer://dynamic_cluster/'
	ProxyPassReverse '/api/spells/' 'balancer://dynamic_cluster/'

	ProxyPass '/' 'balancer://static_cluster/'
	ProxyPassReverse '/' 'balancer://static_cluster/'

</VirtualHost>


vec3 sample_hemisphere()
{
    // Algorithme d'échantillonnage uniforme de l'hémisphère
    float Z = (random_float());
	float beta = acos(2*Z - 1) / 2;	
	float alpha = radians(random_float() * 360);

	float x = sin(beta) * cos(alpha);
	float y = sin(beta) * sin(alpha);
	float z = cos(beta);

	vec3 real = vec3(x,y,z);

	return normalize(real);
}

vec3 random_ray(in vec3 D)
{
    // Algorithme d'orientation de l'échantillon
    vec3 W = normalize(random_vec3());
	while (dot(W,D) == 0)
		W = normalize(random_vec3());

	vec3 U = normalize (cross(D,W));
	vec3 V = normalize (cross(U, D));
	mat3 M = mat3(V, U, D);
	return M * sample_hemisphere();
    //return sample_hemisphere();
}



void main()
{
	// param de srand le nombre de random_float appelé dans le shader
	srand(3u);
	vec3 P = random_ray(normalize(normal));
	gl_Position = pvMatrix * vec4(P,1);
}
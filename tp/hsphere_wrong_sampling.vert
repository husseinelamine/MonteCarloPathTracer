
vec3 sample_hemisphere()
{
	// Algo echantillonnage uniforme hemisphere:
	// Z <- rand entre ? et ?
	// beta <- Z : angle/plan_xy
	// alpha <- rand entre ? et ?
	// x,y,z <- alpha,beta : coord polaire -> cartesienne



	float cosTheta = random_float();
    float sinTheta = sqrt(1.0f - cosTheta * cosTheta);
    float phi = 2 * PI * random_float();
    vec3 s = normalize(vec3(cos(phi) * sinTheta, sin(phi) * sinTheta, cosTheta));

	return s;
		
	// fake !!!!!!
//	return normalize(random_vec3());
}

// D direction principale de l'hemisphere, normalisée
vec3 random_ray(in vec3 D)
{
	// Algo orientation échantillon
	vec3 W = vec3(1,0,0);
	if(abs(D.x) > 0.99)
		W = vec3(0,0,1);
	vec3 U = normalize(cross(D, W));
	vec3 V = normalize(cross(D, U));
	mat3 M = mat3(U, V, D); // Matrice de changement de repère 3x3

    return normalize(M * sample_hemisphere());
}


void main()
{
	// param de srand le nombre de random_float appelé dans le shader
	srand(3u);
	vec3 P = random_ray(normalize(normal));
	gl_Position = pvMatrix * vec4(P,1);
}